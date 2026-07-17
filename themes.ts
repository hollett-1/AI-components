
import { ThemeStyle } from './types';

export const THEME_COLORS: Record<string, Record<string, string>> = {
  baseline: {
    primary: '#0B57D0', onPrimary: '#ffffff', primaryContainer: '#D3E3FD', onPrimaryContainer: '#0842A0',
    secondary: '#00639B', onSecondary: '#ffffff', secondaryContainer: '#C2E7FF', onSecondaryContainer: '#004A77',
    tertiary: '#146C2E', onTertiary: '#ffffff', tertiaryContainer: '#C4EED0', onTertiaryContainer: '#0F5223',
    surface: '#FFFFFF', surfaceLowest: '#FFFFFF', surfaceContainerLow: '#F8FAFD', surfaceContainer: '#F0F4F9', surfaceContainerHigh: '#E9EEF6', surfaceContainerHighest: '#DDE3EA',
    outline: '#747775', outlineVariant: '#C4C7C5',
    onSurface: '#1F1F1F'
  },
  purple: {
    // 3P Android Default Light
    primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EAD0FF', onPrimaryContainer: '#4F378B',
    secondary: '#625B71', onSecondary: '#FFFFFF', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#4A4458',
    tertiary: '#7D5260', onTertiary: '#FFFFFF', tertiaryContainer: '#FFD8E4', onTertiaryContainer: '#633B48',
    surface: '#FEF7FF', surfaceLowest: '#FFFFFF', surfaceContainerLow: '#F7F2FA', surfaceContainer: '#F3EDF7', surfaceContainerHigh: '#ECE6F0', surfaceContainerHighest: '#E6E0E9',
    outline: '#79747E', outlineVariant: '#CAC4D0' // Derived from Surface Variant #E7E0EC / On Surface Variant #49454F
  },
  aurora: {
    primary: '#2962FF', onPrimary: '#ffffff', primaryContainer: '#D2E3FC', onPrimaryContainer: '#001D36',
    secondary: '#535F70', onSecondary: '#ffffff', secondaryContainer: '#D7E3F7', onSecondaryContainer: '#101C2B',
    tertiary: '#6C509E', onTertiary: '#ffffff', tertiaryContainer: '#EADCFE', onTertiaryContainer: '#250059',
    surface: '#FFFFFF', surfaceLowest: '#FFFFFF', surfaceContainerLow: '#F7F9FD', surfaceContainer: '#EFF2F7', surfaceContainerHigh: '#E8ECF2', surfaceContainerHighest: '#E0E4EB',
    outline: '#76777a', outlineVariant: '#c6c6cd'
  },
  green: {
    primary: '#4c662b', onPrimary: '#ffffff', primaryContainer: '#cdeda3', onPrimaryContainer: '#102000',
    secondary: '#586249', onSecondary: '#ffffff', secondaryContainer: '#dce7c8', onSecondaryContainer: '#151e0b',
    tertiary: '#386663', onTertiary: '#ffffff', tertiaryContainer: '#bcece7', onTertiaryContainer: '#00201e',
    surface: '#F9FCF3', surfaceLowest: '#ffffff', surfaceContainerLow: '#f5f7f1', surfaceContainer: '#eff5e5', surfaceContainerHigh: '#e9efdf', surfaceContainerHighest: '#e3e9da',
    outline: '#74796d', outlineVariant: '#c2c8bc'
  },
  red: {
    primary: '#ba1a1a', onPrimary: '#ffffff', primaryContainer: '#ffdad6', onPrimaryContainer: '#410002',
    secondary: '#775653', onSecondary: '#ffffff', secondaryContainer: '#ffdad6', onSecondaryContainer: '#2c1512',
    tertiary: '#725b2e', onTertiary: '#ffffff', tertiaryContainer: '#ffdea5', onTertiaryContainer: '#261900',
    surface: '#FFFFFF', surfaceLowest: '#ffffff', surfaceContainerLow: '#fcf2f1', surfaceContainer: '#FCEBEA', surfaceContainerHigh: '#f9eceb', surfaceContainerHighest: '#f4e6e5',
    outline: '#857372', outlineVariant: '#d7c1c1'
  },
  teal: {
    primary: '#006a60', onPrimary: '#ffffff', primaryContainer: '#74f8e5', onPrimaryContainer: '#00201c',
    secondary: '#4a635f', onSecondary: '#ffffff', secondaryContainer: '#cce8e2', onSecondaryContainer: '#05201c',
    tertiary: '#456179', onTertiary: '#ffffff', tertiaryContainer: '#cce5ff', onTertiaryContainer: '#001e31',
    surface: '#FFFFFF', surfaceLowest: '#ffffff', surfaceContainerLow: '#f2f9f6', surfaceContainer: '#f4fbf8', surfaceContainerHigh: '#eff7f4', surfaceContainerHighest: '#e9f1ee',
    outline: '#6f7977', outlineVariant: '#bec8c6'
  },
  pink: {
    primary: '#bc004b', onPrimary: '#ffffff', primaryContainer: '#ffd9de', onPrimaryContainer: '#400016',
    secondary: '#76565a', onSecondary: '#ffffff', secondaryContainer: '#ffd9de', onSecondaryContainer: '#2c1518',
    tertiary: '#78536b', onTertiary: '#ffffff', tertiaryContainer: '#ffd8ee', onTertiaryContainer: '#2e1126',
    surface: '#FFFFFF', surfaceLowest: '#ffffff', surfaceContainerLow: '#fcf1f3', surfaceContainer: '#fff8f8', surfaceContainerHigh: '#f9ecee', surfaceContainerHighest: '#f4e6e9',
    outline: '#857377', outlineVariant: '#d7c1c6'
  },
  yellow: {
    primary: '#6d5e0f', onPrimary: '#ffffff', primaryContainer: '#f8e387', onPrimaryContainer: '#221b00',
    secondary: '#665e40', onSecondary: '#ffffff', secondaryContainer: '#eee2bc', onSecondaryContainer: '#211b04',
    tertiary: '#43664e', onTertiary: '#ffffff', tertiaryContainer: '#c5eccd', onTertiaryContainer: '#00210f',
    surface: '#FFFFFF', surfaceLowest: '#ffffff', surfaceContainerLow: '#fcf5e3', surfaceContainer: '#F8F3E0', surfaceContainerHigh: '#f9f3dd', surfaceContainerHighest: '#f4edd7',
    outline: '#7d7767', outlineVariant: '#cdc6b4'
  }
};

export const THEME_COLORS_DARK: Record<string, Record<string, string>> = {
  baseline: {
    primary: '#A8C7FA', onPrimary: '#062E6F', primaryContainer: '#0842A0', onPrimaryContainer: '#D3E3FD',
    secondary: '#7FCFFF', onSecondary: '#003355', secondaryContainer: '#004A77', onSecondaryContainer: '#C2E7FF',
    tertiary: '#6DD58C', onTertiary: '#0A3818', tertiaryContainer: '#0F5223', onTertiaryContainer: '#C4EED0',
    surface: '#131314', surfaceLowest: '#0E0E0E', surfaceContainerLow: '#1B1B1B', surfaceContainer: '#1E1F20', surfaceContainerHigh: '#282A2C', surfaceContainerHighest: '#333537',
    outline: '#8E918F', outlineVariant: '#444746'
  },
  purple: {
    // 3P Android Default Dark
    primary: '#D0BCFF', onPrimary: '#381E72', primaryContainer: '#4F378B', onPrimaryContainer: '#EAD0FF',
    secondary: '#CCC2DC', onSecondary: '#332D41', secondaryContainer: '#4A4458', onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8', onTertiary: '#492532', tertiaryContainer: '#633B48', onTertiaryContainer: '#FFD8E4',
    surface: '#141218', surfaceLowest: '#0F0D13', surfaceContainerLow: '#1D1B20', surfaceContainer: '#211F26', surfaceContainerHigh: '#2B2930', surfaceContainerHighest: '#36343B',
    outline: '#938F99', outlineVariant: '#49454F' // Derived from Surface Variant #49454F / On Surface Variant #CAC4D0
  },
  aurora: {
    primary: '#AECBFA', onPrimary: '#002E6C', primaryContainer: '#004BA0', onPrimaryContainer: '#D2E3FC',
    secondary: '#BAC8DB', onSecondary: '#253140', secondaryContainer: '#3B4858', onSecondaryContainer: '#D7E3F7',
    tertiary: '#D3BBFF', onTertiary: '#3C1D6F', tertiaryContainer: '#543686', onTertiaryContainer: '#EADCFE',
    surface: '#0D0E12', surfaceLowest: '#000000', surfaceContainerLow: '#14161A', surfaceContainer: '#1A1C21', surfaceContainerHigh: '#24272D', surfaceContainerHighest: '#2F323A',
    outline: '#8e9199', outlineVariant: '#4c4f54'
  },
  green: {
    primary: '#b1d18a', onPrimary: '#1f3701', primaryContainer: '#354e16', onPrimaryContainer: '#cdeda3',
    secondary: '#c0c9af', onSecondary: '#2a331f', secondaryContainer: '#404934', onSecondaryContainer: '#dce7c8',
    tertiary: '#a0d0cb', onTertiary: '#003735', tertiaryContainer: '#1f4e4c', onTertiaryContainer: '#bcece7',
    surface: '#12140e', surfaceLowest: '#0c0f0b', surfaceContainerLow: '#1a1c18', surfaceContainer: '#1f211b', surfaceContainerHigh: '#292b26', surfaceContainerHighest: '#343631',
    outline: '#8f928b', outlineVariant: '#4a4d45'
  },
  red: {
    primary: '#ffb4ab', onPrimary: '#690005', primaryContainer: '#93000a', onPrimaryContainer: '#ffdad6',
    secondary: '#e7bdb8', onSecondary: '#442927', secondaryContainer: '#5d3f3c', onSecondaryContainer: '#ffdad6',
    tertiary: '#e2c18c', onTertiary: '#402d04', tertiaryContainer: '#594319', onTertiaryContainer: '#ffdea5',
    surface: '#1a1111', surfaceLowest: '#0f0a0a', surfaceContainerLow: '#1f1616', surfaceContainer: '#271d1d', surfaceContainerHigh: '#322727', surfaceContainerHighest: '#3d3232',
    outline: '#a08c8c', outlineVariant: '#574848'
  },
  teal: {
    primary: '#53dbca', onPrimary: '#003732', primaryContainer: '#005048', onPrimaryContainer: '#74f8e5',
    secondary: '#b0ccb6', onSecondary: '#1c3531', secondaryContainer: '#334b47', onSecondaryContainer: '#cce8e2',
    tertiary: '#aacee5', onTertiary: '#123348', tertiaryContainer: '#2c4960', onTertiaryContainer: '#cce5ff',
    surface: '#0f1514', surfaceLowest: '#0b0f0e', surfaceContainerLow: '#171d1c', surfaceContainer: '#1f2524', surfaceContainerHigh: '#29302e', surfaceContainerHighest: '#343b39',
    outline: '#899390', outlineVariant: '#454e4c'
  },
  pink: {
    primary: '#ffb2be', onPrimary: '#660025', primaryContainer: '#900038', onPrimaryContainer: '#ffd9de',
    secondary: '#e6bdc2', onSecondary: '#44292d', secondaryContainer: '#5d3f43', onSecondaryContainer: '#ffd9de',
    tertiary: '#e7b9d6', onTertiary: '#45263c', tertiaryContainer: '#5e3c53', onTertiaryContainer: '#ffd8ee',
    surface: '#1a1113', surfaceLowest: '#140c0d', surfaceContainerLow: '#1f1618', surfaceContainer: '#271d1f', surfaceContainerHigh: '#32272a', surfaceContainerHighest: '#3e3235',
    outline: '#a08c90', outlineVariant: '#57484b'
  },
  yellow: {
    primary: '#dbc76e', onPrimary: '#3a3000', primaryContainer: '#534600', onPrimaryContainer: '#f8e387',
    secondary: '#d1c6a1', onSecondary: '#363016', secondaryContainer: '#4e462a', onSecondaryContainer: '#eee2bc',
    tertiary: '#a9d0b2', onTertiary: '#143722', tertiaryContainer: '#2c4e37', onTertiaryContainer: '#c5eccd',
    surface: '#15140c', surfaceLowest: '#100f09', surfaceContainerLow: '#1d1c16', surfaceContainer: '#24231b', surfaceContainerHigh: '#292b26', surfaceContainerHighest: '#3a3831',
    outline: '#969080', outlineVariant: '#4e4b43'
  }
};
