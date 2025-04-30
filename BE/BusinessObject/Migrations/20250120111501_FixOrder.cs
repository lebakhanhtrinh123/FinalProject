using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class FixOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WithdrawMoney_Wallet",
                table: "WithdrawMoney");

            migrationBuilder.RenameColumn(
                name: "Distrist",
                table: "Customer",
                newName: "District");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryCity",
                table: "Order",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryDistrict",
                table: "Order",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney",
                column: "WalletId",
                principalTable: "Wallet",
                principalColumn: "WalletId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney");

            migrationBuilder.DropColumn(
                name: "DeliveryCity",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "DeliveryDistrict",
                table: "Order");

            migrationBuilder.RenameColumn(
                name: "District",
                table: "Customer",
                newName: "Distrist");

            migrationBuilder.AddForeignKey(
                name: "FK_WithdrawMoney_Wallet",
                table: "WithdrawMoney",
                column: "WalletId",
                principalTable: "Wallet",
                principalColumn: "WalletId");
        }
    }
}
