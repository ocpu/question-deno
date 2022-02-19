export type Config = {
  keypressReader: Deno.Reader & { rid: number },
  writer: Deno.Writer,
}

const questionConfig: Config = {
  keypressReader: Deno.stdin,
  writer: Deno.stdout,
}

export default questionConfig;
