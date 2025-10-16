import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { Wallet } from '../../../entities/wallet.entity';
import { User } from '../../../entities/user.entity';
import { WalletCategory, WalletTopUpDto } from '../DTOs/wallet.dto';

export class WalletService {
  private walletRepository: Repository<Wallet>;
  private userRepository: Repository<User>;

  // Límites diarios por categoría
  private categoryLimits: Record<WalletCategory, number> = {
    JUNIOR: 1000,
    MID: 5000,
    SENIOR: 10000
  };

  constructor() {
    this.walletRepository = AppDataSource.getRepository(Wallet);
    this.userRepository = AppDataSource.getRepository(User);
  }

  private todayISO(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /**
   * Crea una wallet para un usuario TRADER (id_role = 3).
   * category por defecto: JUNIOR
   */
  async createWalletForTrader(userId: string, category: WalletCategory = WalletCategory.JUNIOR) {
    const user = await this.userRepository.findOne({
      where: { id_user: userId },
      relations: ['role'],
    });
    if (!user) throw new Error('USER_NOT_FOUND');

    // Solo TRADER (ajusta si tu dominio difiere)
    if ((user as any).id_role !== 3 && (user as any).role?.id_role !== 3) {
      return null;
    }

    // Si ya existe, devolverla
    const existing = await this.walletRepository.findOne({
      where: { user: { id_user: userId } },
      relations: ['user'],
    });
    if (existing) return existing;

    const wallet = this.walletRepository.create({
      user,
      balance: 0,
      currency: 'USD',
      category,
      daily_limit: this.categoryLimits[category],
      today_consumed: 0,
      last_consumed_date: null,
      created_at: new Date(),
    });
    return await this.walletRepository.save(wallet);
  }

  /** Consultar wallet por usuario */
  async getWalletByUserId(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id_user: userId } },
      relations: ['user'],
    });
    if (!wallet) throw new Error('WALLET_NOT_FOUND');
    return wallet;
  }

  /** Recarga respetando límite diario por categoría. */
  async topUpWallet(userId: string, dto: WalletTopUpDto) {
    if (!dto || typeof dto.amount !== 'number' || dto.amount <= 0) {
      throw new Error('INVALID_AMOUNT');
    }

    const wallet = await this.walletRepository.findOne({
      where: { user: { id_user: userId } },
      relations: ['user'],
    });
    if (!wallet) throw new Error('WALLET_NOT_FOUND');

    // Reset diario si cambió el día
    const today = this.todayISO();
    const last = wallet.last_consumed_date ? wallet.last_consumed_date.toISOString().slice(0, 10) : null;
    if (last !== today) {
      wallet.today_consumed = 0;
      wallet.last_consumed_date = new Date(today);
    }

    // Límite por categoría
    const limitForCategory = this.categoryLimits[wallet.category as WalletCategory] ?? Number(wallet.daily_limit);
    wallet.daily_limit = limitForCategory; // sincroniza por si cambió categoría

    const remaining = Number(limitForCategory) - Number(wallet.today_consumed);
    if (dto.amount > remaining) {
      throw new Error(`Se alcanzó el límite diario. Disponible hoy: ${remaining}`);
    }

    wallet.balance = Number(wallet.balance) + Number(dto.amount);
    wallet.today_consumed = Number(wallet.today_consumed) + Number(dto.amount);

    await this.walletRepository.save(wallet);

    return {
      success: true,
      message: 'Recarga exitosa',
      wallet: {
        balance: wallet.balance,
        category: wallet.category,
        today_consumed: wallet.today_consumed,
        daily_limit: wallet.daily_limit
      }
    };
  }
}
