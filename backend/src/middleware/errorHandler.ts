import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
      code: e.code,
    }));
  }
  // Handle custom API errors
  else if (err instanceof Error && "statusCode" in err) {
    const apiError = err as ApiError;
    statusCode = apiError.statusCode || 500;
    message = err.message || "Internal Server Error";
  }
  // Handle generic errors
  else {
    message = err.message || "Internal Server Error";
  }

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(errors && { validationErrors: errors }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: ApiError = new Error(
    `Not Found - ${req.method} ${req.originalUrl}`
  );
  error.statusCode = 404;
  next(error);
};
