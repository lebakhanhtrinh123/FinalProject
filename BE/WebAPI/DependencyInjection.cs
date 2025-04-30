using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using Repository.Implement;
using Repository.Interface;
using Service.AutoMapper;
using Service.Implement;
using Service.Interface;

namespace WebAPI;

public static class DependencyInjection
{
    public static IServiceCollection AddInfra(this IServiceCollection services, IConfiguration configuration)
    {
        //Unit of work
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        //Authen
        services.AddScoped<IAuthService, AuthService>();
        //Token 
        services.AddScoped<ITokenService, TokenService>();
        //Employee
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        //Store
        services.AddScoped<IStoreService, StoreService>();
        // Category
        services.AddScoped<ICategoryService, CategoryService>(); 
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        // Promotion
        services.AddScoped<IPromotionService, PromotionService>(); 
        services.AddScoped<IPromotionRepository, PromotionRepository>();
        // Customer
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ICustomerService, CustomerService>();
        // Comment
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<ICommentService, CommentService>();
        // Feedback
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IFeedbackService, FeedbackService>();
       
        // Role
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleService, RoleService>();
        // Email
        services.AddScoped<IEmailService, EmailService>();

        //Product
        services.AddScoped<IProductService, ProductService>();

        //Order
        services.AddScoped<IOrderService, OrderService>();  

        //Delivery
        services.AddScoped<IDeliveryService, DeliveryService>();

        //Cart 
        services.AddScoped<ICartService, CartService>();
        services.AddAutoMapper(typeof(MapperConfig).Assembly);
        return services;
    }
}