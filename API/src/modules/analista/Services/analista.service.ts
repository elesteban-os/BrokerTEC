import { AppDataSource } from '../../../config/data-source';
import { Transaction } from '../../../entities/transaccion.entity'; // Asegúrate que el nombre y ruta sean correctos
import { Empresa } from '../../../entities/empresa.entity'; // Asegúrate que el nombre y ruta sean correctos
import { User } from '../../../entities/user.entity'; // Asegúrate que el nombre y ruta sean correctos
import { TraderPortfolio } from '../../../entities/cartera_trader.entity'; // Asegúrate que el nombre y ruta sean correctos
import { Repository, Between } from 'typeorm';


export class AnalistaService {
    private transactionRepository: Repository<Transaction>;
    private empresaRepository: Repository<Empresa>;
    private userRepository: Repository<User>;
    private traderPortfolioRepository: Repository<TraderPortfolio>;

    constructor() {
        this.transactionRepository = AppDataSource.getRepository(Transaction);
        this.empresaRepository = AppDataSource.getRepository(Empresa);
        this.userRepository = AppDataSource.getRepository(User);
        this.traderPortfolioRepository = AppDataSource.getRepository(TraderPortfolio);
    }

    /**
     * Reporte por empresa
     * Historial de transacciones para una empresa especifica
     * REQUISITO: Reporte por empresa, Historial de transacciones 
     * @param id_empresa
     * @param fecha_desde
     * @param fecha_hasta
     */ 
    async getHistorialTransaccionesPorEmpresa(
        id_empresa: number,
        fecha_desde?: Date,
        fecha_hasta?: Date
    ) {
        const query = this.transactionRepository
            .createQueryBuilder('t')
            .innerJoin('t.user', 'u')
            .addSelect(['u.alias'])
            .where('t.id_empresa = :id_empresa', { id_empresa });

        if (fecha_desde && fecha_hasta) {
            query.andWhere('t.fecha_hora BETWEEN :fecha_desde AND :fecha_hasta', { fecha_desde, fecha_hasta });
        } else if (fecha_desde) {
            query.andWhere('t.fecha_hora >= :fecha_desde', { fecha_desde });
        } else if (fecha_hasta) {
            query.andWhere('t.fecha_hora <= :fecha_hasta', { fecha_hasta });
        }

        query.orderBy('t.fecha_hora', 'DESC');

        const transactions = await query.getMany();

        return transactions.map(t => ({
            id_transaction: t.id_transaccion,
            alias_usuario: t.user.alias,
            tipo: t.tipo,
            cantidad: t.cantidad,
            precio: t.precio,
            monto_total: t.cantidad * t.precio,
            fecha_hora: t.fecha_hora,
        }));
    }

    /**
     * Reporte por Alias
     * Historial de transacciones para un usuario
     * REQUISITO: Reporte por alisa
     * @param alias
     * @param filtros
     */
    async getHistorialTransaccionesPorAlias(
        alias: string,
        filtros: {
            fecha_desde?: Date;
            fecha_hasta?: Date;
            id_empresa?: number;
            tipo?: 'Buy' | 'Sell';
        }
    ) {
        const usuario = await this.userRepository.findOne({ where: { alias } });
        if (!usuario) {
            throw new Error('ALIAS_NOT_FOUND');
        }

        const query = this.transactionRepository
            .createQueryBuilder('t')
            .innerJoin('t.empresa', 'e')
            .addSelect(['e.nombre', 'e.id_empresa'])
            .where('t.id_user = :userId', { userId: usuario.id_user });

        if (filtros.fecha_desde && filtros.fecha_hasta) {
            query.andWhere('t.fecha_hora BETWEEN :fecha_desde AND :fecha_hasta', { fecha_desde: filtros.fecha_desde, fecha_hasta: filtros.fecha_hasta});
        } else if (filtros.fecha_desde) {
            query.andWhere('t.fecha_hora >= :fecha_desde', { fecha_desde: filtros.fecha_desde });
        } else if (filtros.fecha_hasta) {
            query.andWhere('t.fecha_hora <= :fecha_hasta', { fecha_hasta: filtros.fecha_hasta });
        } 

        if (filtros.id_empresa) {
            query.andWhere('t.id_empresa =: id_empresa', { id_empresa: filtros.id_empresa });
        }

        if (filtros.tipo) {
            query.andWhere('t.tipo =: tipo', { tipo: filtros.tipo });
        }

        query.orderBy('t.fecha_hora', 'DESC');

        const transactions = await query.getMany();

        return transactions.map(t => ({
            id_transaction: t.id_transaccion,
            empresa_nombre: t.empresa.nombre, 
            tipo: t.tipo,
            cantidad: t.cantidad,
            precio: t.precio,
            monto_total: t.cantidad * t.precio,
            fecha_hora: t.fecha_hora,
        }));
    }

    /**
     * Estadisticas de Mercado
     * Distribucion de acciones traders vs. administracion.
     * REQUISITO: Estadistica de mercados
     * @param id_mercado
     * @param id_empresa 
     */

    async getDistribucionAcciones(id_mercado?: number, id_empresa?: number) {
        const queryEmpresas = this.empresaRepository.createQueryBuilder('e');

        if (id_mercado) {
            queryEmpresas.where('e.id_mercado :=id_mercado', { id_mercado});
        }

        if (id_empresa) {
            queryEmpresas.andWhere('e.id_empresa = :id_emprea', { id_empresa });
        }

        const empresas = await queryEmpresas.getMany();
        if (empresas.length === 0) {
            return { message: "No se encontraron empresas con los filtros aplicados.", estadisticas: [] };
        }

        const estadisticas = [];

        for (const empresa of empresas) {
            const idEmpresaActual = empresa.id_empresa;

            const accionesTotales = empresa.cantidad_acciones;
            
            const resultadoSumaTrader = await this.traderPortfolioRepository
                .createQueryBuilder('ct')
                .select('SUM(ct.cantidad_acciones)', 'totalEnTraders')
                .where('ct.id_empresa = :idEmpresaActual', { idEmpresaActual })
                .getRawOne();

            const totalEnTraders = parseInt(resultadoSumaTrader?.total || '0');

            const accionesEnAdmin = accionesTotales - totalEnTraders;

            const porcentajeTraders = accionesTotales > 0 ? (totalEnTraders / accionesTotales) * 100 : 0;
            const porcentajeAdmin = accionesTotales > 0 ? (accionesEnAdmin / accionesTotales) * 100 : 0;

            estadisticas.push({
              id_empresa: idEmpresaActual,
              nombre_empresa: empresa.nombre,
              acciones_totales: accionesTotales,
              acciones_en_traders: totalEnTraders,
              acciones_en_administracion: accionesEnAdmin,
              porcentaje_traders: parseFloat(porcentajeTraders.toFixed(2)),
              porcentaje_administracion: parseFloat(porcentajeAdmin.toFixed(2)),
          });
        }

        return { estadisticas };
    }

    
}