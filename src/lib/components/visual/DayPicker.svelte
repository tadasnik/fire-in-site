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

  const dateFormat = timeFormat("%a %e %b");

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

  function formatDay(d) {
    const today = new Date();
    if (today.toDateString() === new Date(d).toDateString()) return "Today";
    else {
      return dateFormat(d);
    }
  }
  $: isSelectedDayClass = (d) => {
    return isEqual(startOfDay(d), startOfDay($focusDay))
      ? "grow min-h-24 font-bold text-xl text-primary-900 bg-white border-slate-500 border-t-2 border-l-2 border-r-2 rounded-t-lg"
      : "border-slate-500 border-b-2 border-l-1 border-r-1";
  };
</script>

<div
  class="flex flex-row items-end p-2 space-x-0.5 xl:justify-center
  divide-slate-500"
>
  {#each $daysInForecast as day}
    <div
      class="min-w-40 p-4 bg-gray-100 max-h-20 {isSelectedDayClass(day)}"
      role="button"
      on:click={() => handleDayClick(day)}
    >
      {formatDay(day)}

      <!-- <img src={heli} class="me-3 h-6 sm:h-9" alt="helicopter" /> -->
    </div>
  {/each}
</div>
