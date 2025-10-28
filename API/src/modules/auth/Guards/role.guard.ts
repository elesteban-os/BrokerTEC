import { Request, Response, NextFunction } from "express";

export class RoleGuard {
  /**
   * Extraer rol del usuario autenticado
   * Compatible con:
   * - role: "TRADER"
   * - role: { id_role: 3, role_name: "TRADER" }
   */
  static extractRole(user: any) {
    if (!user) return null;
    if (typeof user.role === "string") return user.role;
    if (typeof user.role === "object" && user.role.role_name)
      return user.role.role_name;
    return null;
  }

  static extractRoleId(user: any) {
    if (!user) return null;
    if (typeof user.role === "object" && user.role.id_role)
      return user.role.id_role;
    if (user.id_role) return user.id_role;
    return null;
  }

  /**
   * Solo administradores pueden acceder
   */
  static adminOnly(req: any, res: Response, next: NextFunction) {
    const user = req.user;
    const roleName = RoleGuard.extractRole(user);
    const roleId = RoleGuard.extractRoleId(user);

    if (!user)
      return res.status(401).json({ success: false, message: "No autenticado" });

    if (roleId !== 1 && roleName !== "ADMIN")
      return res
        .status(403)
        .json({ success: false, message: "Solo administradores pueden acceder" });

    next();
  }

  /**
   * Solo analistas pueden acceder
   */
  static analystOnly(req: any, res: Response, next: NextFunction) {
    const user = req.user;
    const roleName = RoleGuard.extractRole(user);
    const roleId = RoleGuard.extractRoleId(user);

    if (!user)
      return res.status(401).json({ success: false, message: "No autenticado" });

    if (roleId !== 2 && roleName !== "ANALISTA")
      return res
        .status(403)
        .json({ success: false, message: "Solo analistas pueden acceder" });

    next();
  }

  /**
   * Solo traders pueden acceder
   */
  static traderOnly(req: any, res: Response, next: NextFunction) {
    const user = req.user;
    const roleName = RoleGuard.extractRole(user);
    const roleId = RoleGuard.extractRoleId(user);

    if (!user)
      return res.status(401).json({ success: false, message: "No autenticado" });

    if (roleId !== 3 && roleName !== "TRADER")
      return res.status(403).json({
        success: false,
        message: "Solo usuarios con rol TRADER pueden acceder",
      });

    next();
  }

  /**
   * Admin o Analista pueden acceder
   */
  static adminOrAnalyst(req: any, res: Response, next: NextFunction) {
    const user = req.user;
    const roleName = RoleGuard.extractRole(user);
    const roleId = RoleGuard.extractRoleId(user);

    if (!user)
      return res.status(401).json({ success: false, message: "No autenticado" });

    if (
      ![1, 2].includes(roleId) &&
      !["ADMIN", "ANALISTA"].includes(roleName)
    )
      return res.status(403).json({
        success: false,
        message: "Solo administradores o analistas pueden acceder",
      });

    next();
  }

  /**
   * Verificar roles personalizados
   * @param allowedRoles Lista de IDs o nombres de roles permitidos
   */
  static hasRole(allowedRoles: (number | string)[]) {
    return (req: any, res: Response, next: NextFunction) => {
      const user = req.user;
      const roleName = RoleGuard.extractRole(user);
      const roleId = RoleGuard.extractRoleId(user);

      if (!user)
        return res.status(401).json({ success: false, message: "No autenticado" });

      if (!allowedRoles.includes(roleId) && !allowedRoles.includes(roleName))
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Requiere uno de los roles: ${allowedRoles.join(
            ", "
          )}`,
        });

      next();
    };
  }
}
