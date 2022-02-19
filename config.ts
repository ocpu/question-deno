export type Config = {
  keypressReader: Deno.Reader & { rid: number },
  writer: Deno.Writer & { rid: number },
}

const questionConfig: Config = {
  keypressReader: Deno.stdin,
  writer: Deno.stdout,
}

export default questionConfig;
