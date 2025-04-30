using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class FlowerCustom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    CategoryName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "Promotion",
                columns: table => new
                {
                    PromotionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    PromotionName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    PromotionDiscount = table.Column<double>(type: "float", nullable: true),
                    PromotionCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotion", x => x.PromotionId);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "Store",
                columns: table => new
                {
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    StoreName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    City = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    District = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    StorePhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StoreAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StoreEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Store", x => x.StoreId);
                });

            migrationBuilder.CreateTable(
                name: "Customer",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FullName = table.Column<string>(name: "Full Name", type: "nvarchar(255)", maxLength: 255, nullable: true),
                    City = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Distrist = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Gender = table.Column<bool>(type: "bit", nullable: true),
                    Birthday = table.Column<DateTime>(type: "datetime", nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Otp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customer", x => x.CustomerId);
                    table.ForeignKey(
                        name: "FK_Customer_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "Employee",
                columns: table => new
                {
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gender = table.Column<bool>(type: "bit", nullable: true),
                    Birthday = table.Column<DateTime>(type: "datetime", nullable: true),
                    IdentificationNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdentificationFontOfPhoto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdentificationBackOfPhoto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Otp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employee", x => x.EmployeeId);
                    table.ForeignKey(
                        name: "FK_Employee_Role",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "RoleId");
                    table.ForeignKey(
                        name: "FK_Employee_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "Flower",
                columns: table => new
                {
                    FlowerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    FlowerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Decription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sold = table.Column<int>(type: "int", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flower", x => x.FlowerId);
                    table.ForeignKey(
                        name: "FK_Flower_Category",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Flower_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "FlowerBasket",
                columns: table => new
                {
                    FlowerBasketId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    FlowerBasketName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    Decription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Feature = table.Column<bool>(type: "bit", nullable: true),
                    Sold = table.Column<int>(type: "int", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowerBasket", x => x.FlowerBasketId);
                    table.ForeignKey(
                        name: "FK_FlowerBasket_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Size = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Discount = table.Column<double>(type: "float", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Featured = table.Column<bool>(type: "bit", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Sold = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Product_Category",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Product_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "Wallet",
                columns: table => new
                {
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TotalPrice = table.Column<double>(type: "float", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallet", x => x.WalletId);
                    table.ForeignKey(
                        name: "FK_Wallet_Customer",
                        column: x => x.CustomerId,
                        principalTable: "Customer",
                        principalColumn: "CustomerId");
                });

            migrationBuilder.CreateTable(
                name: "ProductCustom",
                columns: table => new
                {
                    ProductCustomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FlowerBasketId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TotalPrice = table.Column<double>(type: "float", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCustom", x => x.ProductCustomId);
                    table.ForeignKey(
                        name: "FK_ProductCustom_FlowerBasket",
                        column: x => x.FlowerBasketId,
                        principalTable: "FlowerBasket",
                        principalColumn: "FlowerBasketId");
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    CommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Feedback = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.CommentId);
                    table.ForeignKey(
                        name: "FK_Comment_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customer",
                        principalColumn: "CustomerId");
                    table.ForeignKey(
                        name: "FK_Comment_Product_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "ProductImage",
                columns: table => new
                {
                    ProductImageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImage", x => x.ProductImageId);
                    table.ForeignKey(
                        name: "FK_ProductImage_Product",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "FlowerCustom",
                columns: table => new
                {
                    FlowerCustomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    FlowerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductCustomId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowerCustom", x => x.FlowerCustomId);
                    table.ForeignKey(
                        name: "FK_FlowerCustom_Flower",
                        column: x => x.FlowerId,
                        principalTable: "Flower",
                        principalColumn: "FlowerId");
                    table.ForeignKey(
                        name: "FK_FlowerCustom_ProductCustom",
                        column: x => x.ProductCustomId,
                        principalTable: "ProductCustom",
                        principalColumn: "ProductCustomId");
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    OrderPrice = table.Column<double>(type: "float", nullable: true),
                    ProductCustomId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StaffId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PromotionID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryDateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    transfer = table.Column<bool>(type: "bit", nullable: true),
                    Refund = table.Column<bool>(type: "bit", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Table_1", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_Order_Customer",
                        column: x => x.CustomerId,
                        principalTable: "Customer",
                        principalColumn: "CustomerId");
                    table.ForeignKey(
                        name: "FK_Order_Employee",
                        column: x => x.StaffId,
                        principalTable: "Employee",
                        principalColumn: "EmployeeId");
                    table.ForeignKey(
                        name: "FK_Order_ProductCustom1",
                        column: x => x.ProductCustomId,
                        principalTable: "ProductCustom",
                        principalColumn: "ProductCustomId");
                    table.ForeignKey(
                        name: "FK_Order_Promotion",
                        column: x => x.PromotionID,
                        principalTable: "Promotion",
                        principalColumn: "PromotionId");
                });

            migrationBuilder.CreateTable(
                name: "Delivery",
                columns: table => new
                {
                    DeliveryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ShipperId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FreeShip = table.Column<bool>(type: "bit", nullable: true),
                    Fee = table.Column<double>(type: "float", nullable: true),
                    PickupLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Delivery", x => x.DeliveryId);
                    table.ForeignKey(
                        name: "FK_Delivery_Employee",
                        column: x => x.ShipperId,
                        principalTable: "Employee",
                        principalColumn: "EmployeeId");
                    table.ForeignKey(
                        name: "FK_Delivery_Order",
                        column: x => x.OrderId,
                        principalTable: "Order",
                        principalColumn: "OrderId");
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    FeedbackId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descripstion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedback", x => x.FeedbackId);
                    table.ForeignKey(
                        name: "FK_Feedback_Customer",
                        column: x => x.CustomerId,
                        principalTable: "Customer",
                        principalColumn: "CustomerId");
                    table.ForeignKey(
                        name: "FK_Feedback_Order",
                        column: x => x.OrderId,
                        principalTable: "Order",
                        principalColumn: "OrderId");
                });

            migrationBuilder.CreateTable(
                name: "OrderDetail",
                columns: table => new
                {
                    OrderDetailId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductTotalPrice = table.Column<double>(type: "float", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    OrderID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetail", x => x.OrderDetailId);
                    table.ForeignKey(
                        name: "FK_OrderDetail_Order",
                        column: x => x.OrderID,
                        principalTable: "Order",
                        principalColumn: "OrderId");
                    table.ForeignKey(
                        name: "FK_OrderDetail_Product",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Method = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TotalPrice = table.Column<double>(type: "float", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_Payment_Customer",
                        column: x => x.CustomerId,
                        principalTable: "Customer",
                        principalColumn: "CustomerId");
                    table.ForeignKey(
                        name: "FK_Payment_Order",
                        column: x => x.OrderId,
                        principalTable: "Order",
                        principalColumn: "OrderId");
                    table.ForeignKey(
                        name: "FK_Payment_Store",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "StoreId");
                });

            migrationBuilder.CreateTable(
                name: "Refund",
                columns: table => new
                {
                    RefundId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    WallerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Refund", x => x.RefundId);
                    table.ForeignKey(
                        name: "FK_Refund_Order",
                        column: x => x.OrderId,
                        principalTable: "Order",
                        principalColumn: "OrderId");
                    table.ForeignKey(
                        name: "FK_Refund_Wallet",
                        column: x => x.WallerId,
                        principalTable: "Wallet",
                        principalColumn: "WalletId");
                });

            migrationBuilder.CreateTable(
                name: "WithdrawMoney",
                columns: table => new
                {
                    WithdrawMoneyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Price = table.Column<double>(type: "float", nullable: true),
                    BankAccountName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    BankNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Otp = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WithdrawMoney", x => x.WithdrawMoneyId);
                    table.ForeignKey(
                        name: "FK_WithdrawMoney_Refund",
                        column: x => x.WalletId,
                        principalTable: "Refund",
                        principalColumn: "RefundId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_CustomerId",
                table: "Comment",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ProductId",
                table: "Comment",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Customer_StoreId",
                table: "Customer",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_OrderId",
                table: "Delivery",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_ShipperId",
                table: "Delivery",
                column: "ShipperId");

            migrationBuilder.CreateIndex(
                name: "IX_Employee_RoleId",
                table: "Employee",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Employee_StoreId",
                table: "Employee",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_CustomerId",
                table: "Feedback",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_OrderId",
                table: "Feedback",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Flower_CategoryId",
                table: "Flower",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Flower_StoreId",
                table: "Flower",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowerBasket_StoreId",
                table: "FlowerBasket",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowerCustom_FlowerId",
                table: "FlowerCustom",
                column: "FlowerId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowerCustom_ProductCustomId",
                table: "FlowerCustom",
                column: "ProductCustomId");

            migrationBuilder.CreateIndex(
                name: "IX_Order_CustomerId",
                table: "Order",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Order_ProductCustomId",
                table: "Order",
                column: "ProductCustomId");

            migrationBuilder.CreateIndex(
                name: "IX_Order_PromotionID",
                table: "Order",
                column: "PromotionID");

            migrationBuilder.CreateIndex(
                name: "IX_Order_StaffId",
                table: "Order",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetail_OrderID",
                table: "OrderDetail",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetail_ProductId",
                table: "OrderDetail",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_CustomerId",
                table: "Payment",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_OrderId",
                table: "Payment",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_StoreId",
                table: "Payment",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Product_CategoryId",
                table: "Product",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Product_StoreId",
                table: "Product",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCustom_FlowerBasketId",
                table: "ProductCustom",
                column: "FlowerBasketId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductId",
                table: "ProductImage",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Refund_OrderId",
                table: "Refund",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Refund_WallerId",
                table: "Refund",
                column: "WallerId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallet_CustomerId",
                table: "Wallet",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WithdrawMoney_WalletId",
                table: "WithdrawMoney",
                column: "WalletId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "Delivery");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "FlowerCustom");

            migrationBuilder.DropTable(
                name: "OrderDetail");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "ProductImage");

            migrationBuilder.DropTable(
                name: "WithdrawMoney");

            migrationBuilder.DropTable(
                name: "Flower");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropTable(
                name: "Refund");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "Wallet");

            migrationBuilder.DropTable(
                name: "Employee");

            migrationBuilder.DropTable(
                name: "ProductCustom");

            migrationBuilder.DropTable(
                name: "Promotion");

            migrationBuilder.DropTable(
                name: "Customer");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "FlowerBasket");

            migrationBuilder.DropTable(
                name: "Store");
        }
    }
}
