using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class FixRefund : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney");

            migrationBuilder.AddForeignKey(
                name: "FK_WithdrawMoney_Wallet",
                table: "WithdrawMoney",
                column: "WalletId",
                principalTable: "Wallet",
                principalColumn: "WalletId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WithdrawMoney_Wallet",
                table: "WithdrawMoney");

            migrationBuilder.AddForeignKey(
                name: "FK_WithdrawMoney_Refund",
                table: "WithdrawMoney",
                column: "WalletId",
                principalTable: "Wallet",
                principalColumn: "WalletId");
        }
    }
}
