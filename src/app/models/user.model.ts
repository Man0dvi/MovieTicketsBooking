// src/app/models/user.model.ts
export interface User {
  id?: number | string;
  username: string;
  phone: string;
  email: string;
  password?: string; // only present in DB for dev (json-server)
  // Additional fields (avatar, roles) can be added later
}
