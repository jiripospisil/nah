interface Version {
  readonly channel: string;
  readonly version: string;
  readonly full: string;
  readonly human: string;
  readonly path?: string;
}

export default Version;
