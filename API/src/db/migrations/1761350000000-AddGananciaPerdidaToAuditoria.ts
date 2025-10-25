import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

/**
 * Migración: Agregar campo ganancia_perdida a tabla auditoria
 * 
 * Fase 7: Compra y Venta de Acciones
 * Registra la ganancia o pérdida en operaciones de venta
 * Positivo = ganancia, Negativo = pérdida
 */
export class AddGananciaPerdidaToAuditoria1761350000000 implements MigrationInterface {
    name = 'AddGananciaPerdidaToAuditoria1761350000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "auditoria",
            new TableColumn({
                name: "ganancia_perdida",
                type: "decimal",
                precision: 15,
                scale: 2,
                isNullable: true,
                comment: "Ganancia o pérdida en ventas (positivo = ganancia, negativo = pérdida)"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("auditoria", "ganancia_perdida");
    }
}
