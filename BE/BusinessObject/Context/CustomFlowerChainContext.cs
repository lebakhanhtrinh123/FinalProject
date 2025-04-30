using System;
using System.Collections.Generic;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BusinessObject.Context;

public partial class CustomFlowerChainContext : DbContext
{
    public CustomFlowerChainContext()
    {
    }
  
    public CustomFlowerChainContext(DbContextOptions<CustomFlowerChainContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Flower> Flowers { get; set; }

    public virtual DbSet<FlowerBasket> FlowerBaskets { get; set; }

    public virtual DbSet<FlowerCustom> FlowerCustoms { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductCustom> ProductCustoms { get; set; }

    public virtual DbSet<ProductImage> ProductImages { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Refund> Refunds { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Store> Stores { get; set; }

    public virtual DbSet<Wallet> Wallets { get; set; }
    public virtual DbSet<Cart> Carts { get; set; }  

    public virtual DbSet<WithdrawMoney> WithdrawMoneys { get; set; }
    /*  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=tcp:customflowerchain.database.windows.net,1433;Initial Catalog=CustomFlowerChain;Persist Security Info=False;User ID=HuongVu;Password=Hoanggia001;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");*/
    /* protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
 #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https: //go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
         => optionsBuilder.UseSqlServer(
             "Server=(local);Database= CustomFlowerChain;UID=sa;PWD=12345;TrustServerCertificate=True");*/
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(GetConnectionString());

    private string? GetConnectionString()
    {
        IConfiguration configuration = new ConfigurationBuilder().SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../WebAPI")).AddJsonFile("appsettings.json", optional: false, reloadOnChange: true).Build();
        return configuration["ConnectionStrings:DBDefault"];
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Category");

            entity.Property(e => e.CategoryId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.ToTable("Comment");

            entity.Property(e => e.CommentId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Feedback).HasMaxLength(255);
            entity.HasOne(d => d.Customer).WithMany(d => d.Comments).HasForeignKey(d => d.CustomerId);
            entity.HasOne(d => d.Product).WithMany(d => d.Comments).HasForeignKey(d => d.ProductId);

        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customer");

            entity.Property(e => e.CustomerId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Birthday).HasColumnType("datetime");
            entity.Property(e => e.City).HasMaxLength(255);
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.District).HasMaxLength(255);
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("Full Name");
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(255);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
            entity.Property(e => e.Status).HasColumnType("nvarchar").HasMaxLength(20);

            entity.HasOne(d => d.Store).WithMany(p => p.Customers)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_Customer_Store");
        });
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.ToTable("Cart");
            entity.Property(e => e.CartId).HasDefaultValueSql("(newid())");
            entity.HasOne(e => e.Customer).WithMany(p=>p.Carts).HasForeignKey(d => d.CustomerId).HasConstraintName("FK_Cart_Customer");

            entity.HasOne(e => e.Product).WithMany(p => p.Carts).HasForeignKey(d => d.ProductId).HasConstraintName("FK_Cart_Product");
        });
        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.ToTable("Delivery");

            entity.Property(e => e.DeliveryId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.DeliveryTime).HasColumnType("datetime");
            entity.Property(e => e.TimeDone).HasColumnType("datetime");

            entity.HasOne(d => d.Order).WithMany(p => p.Deliveries)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Delivery_Order");

            entity.HasOne(d => d.Shipper).WithMany(p => p.Deliveries)
                .HasForeignKey(d => d.ShipperId)
                .HasConstraintName("FK_Delivery_Employee");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.ToTable("Employee");

            entity.Property(e => e.EmployeeId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Birthday).HasColumnType("datetime");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Employees)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_Employee_Role");

            entity.HasOne(d => d.Store).WithMany(p => p.Employees)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_Employee_Store");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.ToTable("Feedback");

            entity.Property(e => e.FeedbackId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK_Feedback_Customer");

            entity.HasOne(d => d.Order).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Feedback_Order");
        });

        modelBuilder.Entity<Flower>(entity =>
        {
            entity.ToTable("Flower");

            entity.Property(e => e.FlowerId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.FlowerName).HasMaxLength(255);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Category).WithMany(p => p.Flowers)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Flower_Category");

            entity.HasOne(d => d.Store).WithMany(p => p.Flowers)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_Flower_Store");
        });

        modelBuilder.Entity<FlowerBasket>(entity =>
        {
            entity.ToTable("FlowerBasket");

            entity.Property(e => e.FlowerBasketId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.FlowerBasketName).HasMaxLength(255);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Store).WithMany(p => p.FlowerBaskets)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_FlowerBasket_Store");
        });

        modelBuilder.Entity<FlowerCustom>(entity =>
        {
            entity.ToTable("FlowerCustom");

            entity.Property(e => e.FlowerCustomId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Flower).WithMany(p => p.FlowerCustoms)
                .HasForeignKey(d => d.FlowerId)
                .HasConstraintName("FK_FlowerCustom_Flower");

            entity.HasOne(d => d.ProductCustom).WithMany(p => p.FlowerCustoms)
                .HasForeignKey(d => d.ProductCustomId)
                .HasConstraintName("FK_FlowerCustom_ProductCustom");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK_Table_1");

            entity.ToTable("Order");

            entity.Property(e => e.OrderId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.DeliveryDateTime).HasColumnType("datetime");
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");
            entity.Property(e => e.DeliveryCity).HasColumnName("DeliveryCity");
            entity.Property(e => e.DeliveryDistrict).HasColumnName("DeliveryDistrict");
            entity.Property(e => e.DeliveryAddress).HasColumnName("DeliveryAddress");


            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Transfer).HasColumnName("transfer");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK_Order_Customer");

            entity.HasOne(d => d.ProductCustom).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ProductCustomId)
                .HasConstraintName("FK_Order_ProductCustom1");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK_Order_Promotion");

            entity.HasOne(d => d.Staff).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StaffId)
                .HasConstraintName("FK_Order_Employee");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.ToTable("OrderDetail");

            entity.Property(e => e.OrderDetailId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_OrderDetail_Order");
            entity.HasOne(d => d.Product).WithMany(d => d.OrderDetails)
                 .HasForeignKey(d => d.ProductId)
                 .HasConstraintName("FK_OrderDetail_Product");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("Payment");

            entity.Property(e => e.PaymentId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.Method).HasMaxLength(255);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Payments)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK_Payment_Customer");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Payment_Order");

            entity.HasOne(d => d.Store).WithMany(p => p.Payments)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_Payment_Store");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Product");

            entity.Property(e => e.ProductId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.ProductName).HasMaxLength(255);
            entity.Property(e => e.Size).HasMaxLength(50);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Product_Category");
            entity.HasOne(d => d.Store).WithMany(p => p.Products).HasForeignKey(d => d.StoreId).HasConstraintName("FK_Product_Store");
        });

        modelBuilder.Entity<ProductCustom>(entity =>
        {
            entity.ToTable("ProductCustom");

            entity.Property(e => e.ProductCustomId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.FlowerBasket).WithMany(p => p.ProductCustoms)
                .HasForeignKey(d => d.FlowerBasketId)
                .HasConstraintName("FK_ProductCustom_FlowerBasket");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.ToTable("ProductImage");

            entity.Property(e => e.ProductImageId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.ProductImage1).HasColumnName("ProductImage");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
            entity.HasOne(d => d.Product).WithMany(d => d.ProductImages).HasForeignKey(d => d.ProductId).HasConstraintName("FK_ProductImage_Product");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId);

            entity.ToTable("Promotion");

            entity.Property(e => e.PromotionId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.PromotionCode).HasMaxLength(255);
            entity.Property(e => e.PromotionName).HasMaxLength(255);
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Refund>(entity =>
        {
            entity.ToTable("Refund");

            entity.Property(e => e.RefundId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Order).WithMany(p => p.Refunds)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Refund_Order");

            entity.HasOne(d => d.Waller).WithMany(p => p.Refunds)
                .HasForeignKey(d => d.WallerId)
                .HasConstraintName("FK_Refund_Wallet");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Role");

            entity.Property(e => e.RoleId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.ToTable("Store");

            entity.Property(e => e.StoreId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.City).HasMaxLength(50);
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.District).HasMaxLength(50);
            entity.Property(e => e.StoreEmail).HasMaxLength(255);
            entity.Property(e => e.StoreName).HasMaxLength(50);
            entity.Property(e => e.StorePhone).HasMaxLength(50);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.ToTable("Wallet");

            entity.Property(e => e.WalletId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.Status).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Wallets)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK_Wallet_Customer");
        });

        modelBuilder.Entity<WithdrawMoney>(entity =>
        {
            entity.ToTable("WithdrawMoney");

            entity.Property(e => e.WithdrawMoneyId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.BankAccountName).HasMaxLength(255);
            entity.Property(e => e.BankName).HasMaxLength(255);
            entity.Property(e => e.BankNumber).HasMaxLength(255);
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.Otp).HasMaxLength(255);
            entity.Property(e => e.Reason).HasMaxLength(255);
            entity.Property(e => e.Status).HasColumnType("datetime");

            entity.HasOne(d => d.Wallet).WithMany(p => p.WithdrawMoneys)
                .HasForeignKey(d => d.WalletId)
                .HasConstraintName("FK_WithdrawMoney_Refund");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
