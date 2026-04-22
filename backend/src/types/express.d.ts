declare namespace Express {
  interface Request {
    admin?: {
      id: string;
      username: string;
    };
  }
}
