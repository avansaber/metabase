import { t } from "c-3po";

import ChartSettingColumnSettings from "metabase/visualizations/components/settings/ChartSettingColumnSettings";

import { keyForColumn } from "metabase/lib/dataset";
import { isDate, isNumber } from "metabase/lib/schema_metadata";
import { getComputedSettings, getSettingsWidgets } from "../settings";

export const COLUMN_SETTINGS = {
  column_settings: {
    section: t`Formatting`,
    widget: ChartSettingColumnSettings,
    getDefault: () => ({}),
    getProps: (series, vizSettings) => ({
      series,
      settings: vizSettings,
      columns: [].concat(...series.map(s => s.data.cols)),
    }),
    useRawSeries: true,
  },
  // HACK: adds a "column" function to settings to get column-level settings that should be passed to formatValue
  column: {
    getDefault(series, vizSettings) {
      const columnsSettings = vizSettings["column_settings"];
      const cache = new Map();
      return column => {
        const key = keyForColumn(column);
        if (!cache.has(key)) {
          cache.set(key, {
            ...getComputedSettingsForColumn(column, columnsSettings[key] || {}),
            column,
          });
        }
        return cache.get(key);
      };
    },
    readDependencies: ["column_settings"],
  },
};

import moment from "moment";

const EXAMPLE_DATE = moment("2018-01-07 17:24");

function dateTimeFormatOption(format, description) {
  return {
    name:
      EXAMPLE_DATE.format(format) + (description ? ` (${description})` : ``),
    value: format,
  };
}

export const DATE_COLUMN_SETTINGS = {
  date_format: {
    title: t`Date style`,
    widget: "radio",
    default: "dddd, MMMM D, YYYY",
    props: {
      options: [
        dateTimeFormatOption("M/D/YYYY", "month, day, year"),
        dateTimeFormatOption("D/M/YYYY", "day, month, year"),
        dateTimeFormatOption("YYYY/M/D", "year, month, day"),
        dateTimeFormatOption("MMMM D, YYYY"),
        dateTimeFormatOption("D MMMM YYYY"),
        dateTimeFormatOption("dddd, MMMM D, YYYY"),
      ],
    },
  },
  date_abbreviate: {
    title: t`Abbreviate names of days and months`,
    widget: "toggle",
    default: false,
  },
  time_enabled: {
    title: t`Show the time`,
    widget: "toggle",
    default: true,
  },
  time_format: {
    title: t`Time style`,
    widget: "radio",
    default: "h:mm A",
    props: {
      options: [
        dateTimeFormatOption("h:mm A", "12-hour clock"),
        dateTimeFormatOption("k:mm", "24-hour clock"),
      ],
    },
    getHidden: (column, settings) => !settings["time_enabled"],
  },
};

export const NUMBER_COLUMN_SETTINGS = {
  show_mini_bar: {
    title: t`Show a mini bar chart`,
    widget: "toggle",
  },
  locale: {
    title: t`Separator style`,
    widget: "radio",
    props: {
      options: [
        { name: "100000.00", value: null },
        { name: "100,000.00", value: "en" },
        { name: "100 000,00", value: "fr" },
        { name: "100.000,00", value: "de" },
      ],
    },
    default: "en",
  },
  decimals: {
    title: t`Number of decimal places`,
    widget: "number",
  },
  scale: {
    title: t`Multiply by a number`,
    widget: "number",
  },
};

const COMMON_COLUMN_SETTINGS = {
  prefix: {
    title: t`Add a prefix`,
    widget: "input",
  },
  suffix: {
    title: t`Add a suffix`,
    widget: "input",
  },
};

export function getSettingDefintionsForColumn(column) {
  if (isDate(column)) {
    return { ...DATE_COLUMN_SETTINGS, ...COMMON_COLUMN_SETTINGS };
  } else if (isNumber(column)) {
    return { ...NUMBER_COLUMN_SETTINGS, ...COMMON_COLUMN_SETTINGS };
  } else {
    return { ...COMMON_COLUMN_SETTINGS };
  }
}

export function getComputedSettingsForColumn(column, storedSettings) {
  const settingsDefs = getSettingDefintionsForColumn(column);
  return getComputedSettings(settingsDefs, column, storedSettings);
}

export function getSettingsWidgetsForColumm(
  column,
  storedSettings,
  onChangeSettings,
) {
  const settingsDefs = getSettingDefintionsForColumn(column);
  const computedSettings = getComputedSettingsForColumn(column, storedSettings);
  const widgets = getSettingsWidgets(
    settingsDefs,
    computedSettings,
    column,
    onChangeSettings,
  );
  return widgets;
}