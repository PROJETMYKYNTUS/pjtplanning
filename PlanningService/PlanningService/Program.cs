using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Interfaces;
using PlanningService.Services;
using System.Text.Json.Serialization;
using PlanningServiceImpl = PlanningService.Services.PlanningService;

var builder = WebApplication.CreateBuilder(args);

// ?? CORS ??
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "http://localhost:80",
                "http://localhost"
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// ?? Database ??
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ?? Services ??
builder.Services.AddScoped<IFloorService, FloorService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<ISubServiceService, SubServiceService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IPlanningService, PlanningServiceImpl>();

// ?? Controllers ??
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var app = builder.Build();

// ????????????????????????????????????????????????????
// ? ÉTAPE 1 — Migrations en PREMIER (avant tout le reste)
// ????????????????????????????????????????????????????
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var maxRetries = 10;
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            db.Database.Migrate();
            Console.WriteLine("? Migrations appliquées avec succès.");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"? Attente DB... tentative {i + 1}/{maxRetries}: {ex.Message}");
            Thread.Sleep(3000);
        }
    }
}

// ????????????????????????????????????????????????????
// ? ÉTAPE 2 — Seed Shifts (après migrations)
// ????????????????????????????????????????????????????
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!context.Shifts.Any())
    {
        context.Shifts.AddRange(
            new PlanningService.Models.Shift { Label = "8h", StartTime = new TimeOnly(8, 0), LunchBreakTime = new TimeOnly(12, 0) },
            new PlanningService.Models.Shift { Label = "9h", StartTime = new TimeOnly(9, 0), LunchBreakTime = new TimeOnly(13, 0) },
            new PlanningService.Models.Shift { Label = "10h", StartTime = new TimeOnly(10, 0), LunchBreakTime = new TimeOnly(14, 0) },
            new PlanningService.Models.Shift { Label = "11h", StartTime = new TimeOnly(11, 0), LunchBreakTime = new TimeOnly(15, 0) }
        );
        await context.SaveChangesAsync();
    }
}

// ????????????????????????????????????????????????????
// ? ÉTAPE 3 — Sync employés (après migrations + seed)
// ????????????????????????????????????????????????????
using (var scope = app.Services.CreateScope())
{
    var planningService = scope.ServiceProvider.GetRequiredService<IPlanningService>();
    await planningService.SyncNewEmployeesAsync();
}

// ?? Middleware ??
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();

app.Run();