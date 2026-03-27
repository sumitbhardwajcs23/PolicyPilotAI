import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { User } from '../models/User'

interface JwtPayload {
  userId: string
  role: string
  adminType?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      dbUser?: any
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Access token required')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Token expired'))
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Invalid token'))
    }
    next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'))
    }

    next()
  }
}

// Middleware: only master admins can proceed
export const requireMasterAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, 'Authentication required'))
    if (req.user.role !== 'admin' && req.user.role !== 'insurer') {
      return next(new AppError(403, 'Admin access required'))
    }
    const dbUser = await User.findById(req.user.userId).select('adminType')
    if (!dbUser) return next(new AppError(404, 'User not found'))
    if (dbUser.adminType !== 'master') {
      return next(new AppError(403, 'Master admin privileges required'))
    }
    req.dbUser = dbUser
    next()
  } catch (error) {
    next(error)
  }
}

// Helper: load the dbUser and attach permissions to req
export const loadAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, 'Authentication required'))
    const dbUser = await User.findById(req.user.userId).select('adminType permissions role')
    if (!dbUser) return next(new AppError(404, 'User not found'))
    req.dbUser = dbUser
    next()
  } catch (error) {
    next(error)
  }
}

// Helper: check if user has a specific permission (master always passes)
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dbUser = req.dbUser
    if (!dbUser) return next(new AppError(401, 'Authentication required'))
    if (dbUser.adminType === 'master') return next()
    if (!dbUser.permissions?.includes(permission)) {
      return next(new AppError(403, `Permission '${permission}' required`))
    }
    next()
  }
}

