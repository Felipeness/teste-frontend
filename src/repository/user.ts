import { readFileSync } from "fs";

import { SetupUser, UserInfo } from "../api";
import { DateTime } from "luxon";

const userData: UserInfo[] = JSON.parse(
  readFileSync("user-data.json", "utf-8"),
  (k, v) => {
    if (["birthDate", "deletedAt"].includes(k)) {
      const date = DateTime.fromISO(v);
      if (date.isValid) {
        return date.toJSDate();
      }
    }
    return v;
  }
);

export class UserRepository {
  async create(data: SetupUser) {
    const user: UserInfo = {
      ...data,
      id: userData.length + 1,
      isActive: false,
      inactiveReason: null,
      deletedAt: null,
    };
    userData.push(user);
    return user;
  }
  async update(id: number, data: Partial<UserInfo>) {
    const user = userData.find((u: UserInfo) => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    Object.assign(user, data);
    return user;
  }
  async delete(id: number) {
    const user = userData.find((u: UserInfo) => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    user.isActive = false;
    user.deletedAt = new Date();
    return true;
  }
  async getAll() {
    return userData.map((u: UserInfo) => ({ ...u }));
  }
  async getById(id: number) {
    return userData.find((u: UserInfo) => u.id === id);
  }
}
