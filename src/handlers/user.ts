import { Fatal } from "@sdkgen/node-runtime";
import { ApiConfig, UserNotFound } from "../api";
import { UserRepository } from "../repository/user";
import { validateUser } from "./helpers/userHelper";
import { LoggerContext } from "../middlewares/logger";

function createUserFn<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["createUser"] {
  return async (ctx, args) => {
    ctx.logger.info(`Creating user: ${args.user.name} - ${args.user.email}`);
    const isValidUser = validateUser(args.user);
    if (!isValidUser) {
      throw new Fatal("Invalid user");
    }
    return userRepo.create(args.user);
  };
}

function updateUserFn<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["updateUser"] {
  return async (ctx, args) => {
    ctx.logger.info(`Updating user: #${args.id}`);
    const isValidUser = validateUser(args.user);
    if (!isValidUser) {
      throw new Fatal("Invalid user");
    }
    return userRepo.update(args.id, args.user);
  };
}

function getAllUsersFn<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["getAllUsers"] {
  return async (ctx) => {
    ctx.logger.info("Getting all users");
    return userRepo.getAll();
  };
}

function getUserByIdFn<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["getUserById"] {
  return async (ctx, args) => {
    ctx.logger.info(`Getting user: #${args.id}`);
    const user = await userRepo.getById(args.id);
    if (!user) {
      throw new UserNotFound(`User with id ${args.id} does not exist`);
    }
    return user;
  };
}

function activateUserFn<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["activateUser"] {
  return async (ctx, args) => {
    ctx.logger.info(`Activating user: #${args.userId}`);
    const user = await userRepo.getById(args.userId);
    if (!user) {
      throw new UserNotFound(`User with id ${args.userId} does not exist`);
    }
    await userRepo.update(args.userId, { ...user, isActive: true, inactiveReason: null });
    return true;
  };
}

function inactivateUser<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["inactivateUser"] {
  return async (ctx, args) => {
    ctx.logger.info(`Inactivating user: #${args.userId}`);
    const user = await userRepo.getById(args.userId);
    if (!user) {
      throw new UserNotFound(`User with id ${args.userId} does not exist`);
    }
    await userRepo.update(args.userId, {
      ...user,
      isActive: false,
      inactiveReason: args.reason,
    });
    return true;
  };
}

function deleteUser<TContext extends object>(
  api: ApiConfig<TContext>,
  userRepo: UserRepository
): ApiConfig<TContext & LoggerContext>["fn"]["deleteUser"] {
  return async (ctx, args) => {
    ctx.logger.info(`Deleting user: #${args.userId}`);
    const user = await userRepo.getById(args.userId);
    if (!user) {
      throw new UserNotFound(`User with id ${args.userId} does not exist`);
    }
    await userRepo.delete(args.userId);
    return true;
  }
}

export function registerUserHandler<TContext extends LoggerContext>(
  api: ApiConfig<TContext>
) {
  const userRepo = new UserRepository();
  api.fn.createUser = createUserFn(api, userRepo);
  api.fn.updateUser = updateUserFn(api, userRepo);
  api.fn.getAllUsers = getAllUsersFn(api, userRepo);
  api.fn.getUserById = getUserByIdFn(api, userRepo);
  api.fn.activateUser = activateUserFn(api, userRepo);
  api.fn.inactivateUser = inactivateUser(api, userRepo);
  api.fn.deleteUser = deleteUser(api, userRepo);
}
