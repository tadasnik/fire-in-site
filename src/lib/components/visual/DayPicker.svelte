<script>
  import { timeFormat } from "d3-time-format";
  import { isEqual, startOfDay } from "date-fns";
  import { dateTime } from "$lib/shared/stores/timeStore";
  import {
    currentTimeIndex,
    forecastMode,
    focusDayIndex,
    daysInForecast,
  } from "$lib/shared/stores/forecastStore";
  import {
    currentDateTime,
    timeMode,
    focusDay,
  } from "$lib/shared/stores/timeStore";
  import heli from "$lib/assets/icons/helicop.png";

  const dateFormatShort = timeFormat("%a %e");
  const dateFormatLong = timeFormat("%a %e %b");

  // $: console.log("focusDay", $focusDay);
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };

  function handleDayClick(day) {
    if ($timeMode === "current") {
      $timeMode = "user";
    }
    $currentDateTime = new Date(day).addHours(12);
  }

  function formatDayShort(d) {
    const today = new Date();
    if (today.toDateString() === new Date(d).toDateString()) return "Today";
    return dateFormatShort(d);
  }

  function formatDayLong(d) {
    const today = new Date();
    if (today.toDateString() === new Date(d).toDateString()) return "Today";
    return dateFormatLong(d);
  }
  let isSelectedDayClass = $derived((d) => {
    return isEqual(startOfDay(d), startOfDay($focusDay))
      ? "min-h-10 sm:min-h-14 md:min-h-16 font-bold text-primary-900 bg-white border-slate-500 border-t-2 border-l-2 border-r-2 rounded-t-lg"
      : "border-slate-500 border-b-2";
  });
</script>

<div
  class="flex flex-row items-end justify-center p-2 space-x-0.5 divide-slate-500 w-full"
>
  {#each $daysInForecast as day}
    <div
      class="w-22 sm:w-26 md:w-36 lg:w-40 shrink-0 p-1 sm:p-2 md:p-3 lg:p-4 text-xs sm:text-sm md:text-base bg-gray-100 {isSelectedDayClass(
        day,
      )}"
      role="button"
      onclick={() => handleDayClick(day)}
    >
      <span class="sm:hidden">{formatDayShort(day)}</span>
      <span class="hidden sm:inline">{formatDayLong(day)}</span>

      <!-- <img src={heli} class="me-3 h-6 sm:h-9" alt="helicopter" /> -->
    </div>
  {/each}
</div>
