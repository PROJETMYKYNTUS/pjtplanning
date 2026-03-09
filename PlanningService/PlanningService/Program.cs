// Program.cs — VERSION CORRIGÉE
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Interfaces;
using PlanningService.Services;
using System.Text.Json.Serialization;

// ? Alias pour éviter le conflit entre namespace PlanningService
// et la classe PlanningService.Services.PlanningService
using PlanningServiceImpl = PlanningService.Services.PlanningService;

var builder = WebApplication.CreateBuilder(args);

// ?? CORS ??
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ?? Database ??
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ?? Services ??
// ? FIX — utiliser directement le nom de classe sans chemin complet
// car tous les services sont dans PlanningService.Services (déjà importé)
builder.Services.AddScoped<IFloorService, FloorService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<ISubServiceService, SubServiceService>();
builder.Services.AddScoped<IUserService, UserService>();      // ? corrigé
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IPlanningService, PlanningServiceImpl>(); // ? alias

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

using (var scope = app.Services.CreateScope())
{
    var planningService = scope.ServiceProvider
        .GetRequiredService<IPlanningService>();

    await planningService.SyncNewEmployeesAsync(); // ? sync au démarrage
}

// ?? Seed Shifts ??
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