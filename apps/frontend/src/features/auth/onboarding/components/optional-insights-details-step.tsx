'use client';

import type { ComponentType, SVGProps } from 'react';
import {
  Binoculars,
  Camera,
  ChevronDown,
  CircleQuestion,
  Flame,
  HeartPulse,
  PlanetEarth,
  Persons,
} from '@gravity-ui/icons';
import { Dropdown, Header, Label, Tag, TagGroup } from '@heroui/react';

import { ageRangeOptions, interestOptions, referralOptions } from '../lib/onboarding-options';
import type { AgeRange, HikingInterest, ReferralSource } from '../types/onboarding';

type OptionalInsightsDetailsStepProps = {
  ageRange: AgeRange | '';
  interests: HikingInterest[];
  referralSource: ReferralSource | '';
  onAgeRangeChange: (value: AgeRange | '') => void;
  onInterestsChange: (value: HikingInterest[]) => void;
  onReferralSourceChange: (value: ReferralSource | '') => void;
};

type ProfileChoiceOption<Value extends string> = {
  value: Value;
  label: string;
};

type ProfileChoiceDropdownProps<Value extends string> = {
  id: string;
  label: string;
  menuHeading: string;
  placeholder: string;
  value: Value | '';
  options: readonly ProfileChoiceOption<Value>[];
  onChange: (value: Value | '') => void;
};

const interestIcons: Record<HikingInterest, ComponentType<SVGProps<SVGSVGElement>>> = {
  NATURE: PlanetEarth,
  PHOTOGRAPHY: Camera,
  CAMPING: Flame,
  BIRDWATCHING: Binoculars,
  FITNESS: HeartPulse,
  COMMUNITY: Persons,
  OTHER: CircleQuestion,
};

const dropdownItemClassName =
  'onboarding-theme-hover rounded-[6px] text-sm text-foreground data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground';

function ProfileChoiceDropdown<Value extends string>({
  id,
  label,
  menuHeading,
  placeholder,
  value,
  options,
  onChange,
}: ProfileChoiceDropdownProps<Value>) {
  const emptyOptionKey = `${id}-empty`;
  const selectedKey = value || emptyOptionKey;
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="text-sm font-semibold">
        {label} <span className="font-normal text-muted-foreground">· optional</span>
      </p>
      <Dropdown>
        <Dropdown.Trigger
          aria-labelledby={`${id}-label`}
          className="onboarding-theme-hover flex h-10 w-full items-center justify-between rounded-[8px] border border-border bg-card px-3 text-sm font-normal text-card-foreground shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </Dropdown.Trigger>
        <Dropdown.Popover className="min-w-[256px] rounded-[8px] border border-border bg-popover text-popover-foreground shadow-lg">
          <Dropdown.Menu
            className="p-1"
            aria-label={`${label} options`}
            selectedKeys={new Set([selectedKey])}
            selectionMode="single"
            onSelectionChange={(selection) => {
              if (selection === 'all') return;

              const selectedOption = Array.from(selection)[0];
              onChange(
                !selectedOption || selectedOption === emptyOptionKey
                  ? ''
                  : (selectedOption as Value),
              );
            }}
          >
            <Dropdown.Section>
              <Header className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {menuHeading}
              </Header>
              <Dropdown.Item
                id={emptyOptionKey}
                textValue={placeholder}
                className={dropdownItemClassName}
              >
                <Dropdown.ItemIndicator />
                <Label>{placeholder}</Label>
              </Dropdown.Item>
              {options.map((option) => (
                <Dropdown.Item
                  key={option.value}
                  id={option.value}
                  textValue={option.label}
                  className={dropdownItemClassName}
                >
                  <Dropdown.ItemIndicator />
                  <Label>{option.label}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}

export function OptionalInsightsDetailsStep({
  ageRange,
  interests,
  referralSource,
  onAgeRangeChange,
  onInterestsChange,
  onReferralSourceChange,
}: OptionalInsightsDetailsStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-[#52645f] dark:text-[#c3d5cb]">
        Add any details you’d like to share. Each answer is optional, and these details stay private
        and are used only to understand our hiking community in aggregate.
      </p>

      <div className="space-y-5">
        <ProfileChoiceDropdown
          id="onboarding-age"
          label="Age range"
          menuHeading="Select an age range"
          placeholder="Prefer not to say"
          value={ageRange}
          options={ageRangeOptions}
          onChange={onAgeRangeChange}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">What else do you enjoy?</legend>
          <TagGroup
            aria-label="What else do you enjoy?"
            selectionMode="multiple"
            selectedKeys={new Set(interests)}
            onSelectionChange={(selection) => {
              if (selection === 'all') {
                onInterestsChange(interestOptions.map((option) => option.value));
                return;
              }

              onInterestsChange(Array.from(selection) as HikingInterest[]);
            }}
            size="sm"
          >
            <TagGroup.List className="flex flex-wrap gap-2">
              {interestOptions.map((option) => {
                const Icon = interestIcons[option.value];

                return (
                  <Tag
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                    className="onboarding-interest-tag min-h-7 gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {option.label}
                  </Tag>
                );
              })}
            </TagGroup.List>
          </TagGroup>
        </fieldset>

        <ProfileChoiceDropdown
          id="onboarding-referral"
          label="How did you find DAPYO?"
          menuHeading="Choose how you found us"
          placeholder="Choose an option"
          value={referralSource}
          options={referralOptions}
          onChange={onReferralSourceChange}
        />
      </div>
    </div>
  );
}
