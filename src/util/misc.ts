export function mod11sumCheck(value: string, digits: number = 2): boolean {
  const cleanValue = value
    .replace(/\D/g, "")
    .split("")
    .map((val) => parseInt(val));

  if (new Set(cleanValue).size === 1) {
    return false;
  }

  let checksum = "";
  while (digits > 0) {
    const testValue = cleanValue.slice(0, -digits);

    const sum = testValue.reverse().reduce((sum, val, idx) => (sum += val * (idx + 2)), 0);
    checksum = checksum + ((sum * 10) % 11).toString().at(-1);
    --digits;
  }
  return cleanValue.join("").endsWith(checksum);
}
