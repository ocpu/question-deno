export type Config = {
  keypressReader: Deno.Reader & { rid: number },
}

const questionConfig: Config = {
  keypressReader: Deno.stdin,
}

export default questionConfig;
