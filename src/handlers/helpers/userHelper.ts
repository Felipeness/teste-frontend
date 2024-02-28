import { InvalidArgument, SetupUser } from "../../api";
import { mod11sumCheck } from "../../util/misc";

export function validateUser(user: SetupUser) {
  if (!user.name) {
    throw new InvalidArgument("Name is required", { field: "name", reason: "required" });
  }
  if (!user.email) {
    throw new InvalidArgument("Email is required", { field: "email", reason: "required" });
  }
  if (!user.password) {
    throw new InvalidArgument("Password is required", { field: "password", reason: "required" });
  }
  if (!user.cpf) {
    throw new InvalidArgument("CPF is required", { field: "cpf", reason: "required" });
  }
  if (!mod11sumCheck(user.cpf)) {
    throw new InvalidArgument("Invalid CPF", { field: "cpf", reason: "invalid" });
  }
  return true;
}
