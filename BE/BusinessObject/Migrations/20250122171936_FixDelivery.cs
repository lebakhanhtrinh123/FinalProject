using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class FixDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdateAt",
                table: "Delivery",
                newName: "TimeDone");

            migrationBuilder.RenameColumn(
                name: "CreateAt",
                table: "Delivery",
                newName: "DeliveryTime");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Delivery",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Delivery",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryImage",
                table: "Delivery",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "Delivery",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Delivery");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Delivery");

            migrationBuilder.DropColumn(
                name: "DeliveryImage",
                table: "Delivery");

            migrationBuilder.DropColumn(
                name: "note",
                table: "Delivery");

            migrationBuilder.RenameColumn(
                name: "TimeDone",
                table: "Delivery",
                newName: "UpdateAt");

            migrationBuilder.RenameColumn(
                name: "DeliveryTime",
                table: "Delivery",
                newName: "CreateAt");
        }
    }
}
