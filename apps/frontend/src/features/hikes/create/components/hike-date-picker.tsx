'use client';

import { Calendar, DateField, DatePicker, Label, Tooltip, type DateValue } from '@heroui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar as CalendarIcon } from '@boxicons/react';

export function HikeDatePicker({
  value,
  onChange,
  portalContainer,
}: {
  value: DateValue | null;
  onChange: (date: DateValue | null) => void;
  portalContainer?: HTMLElement | null;
}) {
  const minimumDate = today(getLocalTimeZone()).add({ days: 1 });
  const formattedDate = value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(value.year, value.month - 1, value.day),
      )
    : null;

  return (
    <div className="shrink-0">
      <DatePicker value={value} onChange={onChange} minValue={minimumDate} className="w-auto">
        <Label className="sr-only">Hike date</Label>
        <DateField.Group className="!inline-flex !h-8 !w-8 !min-w-0 !overflow-visible !rounded-full !border-0 !bg-transparent !p-0 !shadow-none">
          <DateField.Input className="sr-only">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix className="!m-0 !p-0">
            <Tooltip delay={0}>
              <DatePicker.Trigger
                aria-label={
                  formattedDate ? `Change hike date, ${formattedDate}` : 'Choose hike date'
                }
                className="!inline-grid !size-8 !shrink-0 !place-items-center !rounded-full !border-0 !bg-[#e8ece9] !p-0 !text-[#5b6b60] transition-colors hover:!bg-[#1d604c] hover:!text-white dark:!bg-white/10 dark:!text-white/70 dark:hover:!bg-[#1d604c] dark:hover:!text-white"
              >
                <CalendarIcon pack="filled" className="size-4" aria-hidden="true" />
              </DatePicker.Trigger>
              <Tooltip.Content
                className="z-[100] whitespace-nowrap"
                UNSTABLE_portalContainer={portalContainer ?? undefined}
                showArrow
                placement="top"
                offset={8}
              >
                <Tooltip.Arrow />
                <p>Schedule date</p>
              </Tooltip.Content>
            </Tooltip>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover
          placement="bottom end"
          UNSTABLE_portalContainer={portalContainer ?? undefined}
          className="pointer-events-auto z-[100] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
        >
          <Calendar
            aria-label="Choose hike date"
            minValue={minimumDate}
            className="text-card-foreground"
          >
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => (
                  <Calendar.Cell
                    date={date}
                    className="aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-[selected=true]:!bg-[#17342e] data-[selected=true]:!text-white"
                  />
                )}
              </Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </div>
  );
}
