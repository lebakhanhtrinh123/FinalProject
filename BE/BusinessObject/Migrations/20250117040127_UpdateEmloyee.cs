using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmloyee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney");

            migrationBuilder.RenameColumn(
                name: "Decription",
                table: "Flower",
                newName: "Description");

            migrationBuilder.AddColumn<string>(
                name: "ColorMoto",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotoType",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumberMoto",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Customer",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

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
                name: "ColorMoto",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "MotoType",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "NumberMoto",
                table: "Employee");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Flower",
                newName: "Decription");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Customer",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney",
                column: "WalletId",
                principalTable: "Refund",
                principalColumn: "RefundId");
        }
    }
}
