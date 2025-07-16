/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Base URL - Base URL for the CG Raycast */
  "BASE_URL"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `market-info` command */
  export type MarketInfo = ExtensionPreferences & {}
  /** Preferences accessible in the `open-interest` command */
  export type OpenInterest = ExtensionPreferences & {}
  /** Preferences accessible in the `exchange-info` command */
  export type ExchangeInfo = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `market-info` command */
  export type MarketInfo = {
  /** BTC */
  "symbol": string
}
  /** Arguments passed to the `open-interest` command */
  export type OpenInterest = {
  /** BTC */
  "symbol": string
}
  /** Arguments passed to the `exchange-info` command */
  export type ExchangeInfo = {}
}

