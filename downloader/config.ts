import * as path from "https://deno.land/std@0.153.0/path/mod.ts";
import home_dir from "https://deno.land/x/dir/home_dir/mod.ts";

export interface Config {
  network: {
    userAgent: string;
    navigationTimeout: number;
  };
  downloader: {
    dir: string;
    max: number
  };
}

export type UserConfig = Partial<Config>

const config: Config = {
  network: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36",
    navigationTimeout:  0 // never timeout
  },
  downloader: {
    dir: path.joinGlobs([home_dir() || ".", "douyin_video_downloads"]),
    max: 10,
  },
};

export default config;
