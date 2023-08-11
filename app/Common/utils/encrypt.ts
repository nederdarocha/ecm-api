import bcrypt from "bcrypt";
const saltRounds = 10;

export async function encryptPassword(password: string): Promise<{ salt: string; hash: string }> {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  } catch (error) {
    throw new Error("Erro ao criptografar a senha");
  }
}

export async function comparePassword(
  password: string,
  salt: string | null,
  hash: string | null
): Promise<boolean> {
  try {
    const newHash = await bcrypt.hash(password, salt ?? "");
    return newHash === hash;
  } catch (error) {
    throw new Error("Erro ao comparar as senhas");
  }
}
