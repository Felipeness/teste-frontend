import { configure } from "safe-stable-stringify";
import { LEVEL, MESSAGE } from "triple-beam";
import { Logform, createLogger, format, transports } from "winston";
type MessageField = {
  fieldName: string;
  printPrefix?: string;
  printCondition?: (info: Logform.TransformableInfo) => boolean;
  defaultValue?: string;
};
const jsonEncode = configure({
  circularValue: "[Circular]",
  maximumDepth: 5,
  maximumBreadth: 10,
});

function offline(): Logform.Format {
  const opts = {
    fields: ["module", "resource"],
    metaMaxLen: 1000,
  };

  return {
    transform(info) {
      const msg: string[] = [];
      const printedFields = ["timestamp", "level", "message"];

      if ("timestamp" in info && typeof info.timestamp === "string") {
        msg.push(info.timestamp);
      }

      if ("level" in info && typeof info.level === "string") {
        msg.push(info.level);
      }

      if (!("level" in info) && !!info[LEVEL]) {
        msg.push(info[LEVEL]);
      }

      for (const optField of opts.fields) {
        const field: MessageField = { fieldName: "" };

        if (typeof optField === "string") {
          field.fieldName = optField;
        } else {
          Object.assign(field, optField);
        }

        if (field.fieldName in info) {
          printedFields.push(field.fieldName);

          if (!!field.printCondition && !field.printCondition(info)) {
            continue;
          }

          let fieldValue = info[field.fieldName];

          if (fieldValue === undefined) {
            if (field.defaultValue === undefined) {
              continue;
            }

            fieldValue = field.defaultValue;
          }

          if (fieldValue === null) {
            fieldValue = "null";
          }

          if (typeof fieldValue === "object" && !!fieldValue) {
            fieldValue = jsonEncode(fieldValue);
          }

          if (!!fieldValue) {
            msg.push(
              `${
                field.printPrefix ?? field.fieldName
              }: ${fieldValue.toString()}`
            );
          }
        }
      }

      if ("message" in info && typeof info.message === "string") {
        msg.push(info.message);
      }

      if (!("message" in info) && !!info[MESSAGE]) {
        msg.push(info[MESSAGE]);
      }

      msg.push(
        `meta: ${Object.entries(info)
          .map(([key, val]: [string, unknown]) => {
            if (printedFields.includes(key) || val === undefined) {
              return false;
            }

            let jsonVal = jsonEncode(val);

            if (jsonVal.length >= opts.metaMaxLen) {
              jsonVal = `${jsonVal.slice(0, opts.metaMaxLen)}[...]`;
            }

            return `${key}=${jsonVal}`;
          })
          .filter((el) => !!el)
          .join(", ")}`
      );

      info[MESSAGE] = msg.join(" | ");
      return info;
    },
  };
}

export const logger = createLogger({
  levels: ["crit", "error", "warn", "info", "debug"].reduce((agg, level, idx) => ({...agg, [level]: idx}), {}),
  level: process.env.MIN_LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    offline(),
    format.colorize({ all: true }),
  ),
  transports: [new transports.Console()],
})
