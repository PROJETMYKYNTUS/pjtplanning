using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Charger ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// CORS pour Angular
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngular", policy => {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Ajouter Ocelot
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors("AllowAngular");

// Lancer Ocelot
await app.UseOcelot();

app.Run();