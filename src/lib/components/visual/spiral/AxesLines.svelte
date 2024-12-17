<script>
  import { getContext } from "svelte";
  import {
    eachMonthOfInterval,
    subYears,
    addYears,
    add,
    fromUnixTime,
    getDayOfYear,
    getTime,
    addMonths,
    addDays,
    subDays,
    format,
  } from "date-fns";
  import { timeFormat } from "d3-time-format";
  import { timeDay, timeMonth, timeYear } from "d3-time";
  import { cartesianFromPolarRad } from "$lib/components/visual/spiral/utils.js";
  import { addMonth } from "$lib/components/visual/spiral/timeUtils.js";

  export let polarProps = {};

  const { width, height, xScale, yScale, xDomain, data } =
    getContext("LayerCake");

  function getAngle(date) {
    return polarProps.angleScale(getDayOfYear(date)) + polarProps.angleRotate;
  }
  function getDistance(date) {
    return polarProps.radiusScale(getTime(date));
  }
  function getAngleDistance(date) {
    return {
      angle: getAngle(date),
      distance: getDistance(date),
    };
  }

  $: todayMarker = () => {
    const today = new Date();
    const { angle: todayAngle, distance: todayDistance } =
      getAngleDistance(today);
    const { angle: startAngle, distance: startDistance } = getAngleDistance(
      subDays(addYears(today, 2), 5),
    );
    const { angle: endAngle, distance: endDistance } = getAngleDistance(
      add(today, { years: 2, days: 5 }),
    );
    const { angle: todayAngleNext, distance: todayDistanceNext } =
      getAngleDistance(addYears(today, 2));
    const { x: x1, y: y1 } = cartesianFromPolarRad(todayDistance, todayAngle);
    const { x: x2, y: y2 } = cartesianFromPolarRad(startDistance, startAngle);
    const { x: x3, y: y3 } = cartesianFromPolarRad(endDistance, endAngle);
    const { x: x4, y: y4 } = cartesianFromPolarRad(
      todayDistanceNext,
      todayAngleNext,
    );
    return {
      name: "Today",
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4,
    };
  };
  // Dates of months in previous year
  // the *0.001 is necessary to convert from milliseconds to seconds
  const startDate = fromUnixTime($data[0].date * 0.001);
  const extStartDate = subYears(startDate, 1);
  const monthsPrevYear = eachMonthOfInterval({
    start: extStartDate,
    end: startDate,
  }).slice(0, -1);

  //dates of months in next year
  const lastDate = fromUnixTime($data[$data.length - 1].date * 0.001);
  const extEndDate = addYears(lastDate, 1);
  const monthsNextYear = eachMonthOfInterval({
    start: lastDate,
    end: extEndDate,
  }).slice(1);

  $: monthProps = monthsNextYear.map((month, i) => {
    const { angle: startAngle, distance: start } = getAngleDistance(
      monthsPrevYear[i],
    );
    const { angle: endAngle, distance: end } = getAngleDistance(month);
    const endAngleNext = getAngle(addMonths(month, 1));
    const { x: x1, y: y1 } = cartesianFromPolarRad(start, startAngle);
    const { x: x2, y: y2 } = cartesianFromPolarRad(end, endAngle);
    const { x: x3, y: y3 } = cartesianFromPolarRad(end, endAngleNext);
    return {
      i,
      name: format(month, "MMM"),
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
    };
  });

  $: todayProps = todayMarker();
  $: console.log("monthProps", monthProps, todayProps);

  $: getArc = (d) => {
    const distance = $xScale($xDomain[1]);
    return [
      "M",
      $xScale(d.x2),
      $yScale(d.y2),
      "A",
      distance,
      distance,
      0,
      0,
      1,
      $xScale(d.x3),
      $yScale(d.y3),
    ].join(" ");
  };
</script>

<g>
  {#each monthProps as month}
    <line
      x1={$xScale(month.x1)}
      y1={$yScale(month.y1)}
      x2={$xScale(month.x2)}
      y2={$yScale(month.y2)}
      stroke="#ccc"
      stroke-width="2"
      stroke-dasharray="2 2"
      fill="none"
    />
    <path id={month.i} fill="none" d={getArc(month)} />
    <text>
      <textPath href="#{month.i}" startOffset="50%" text-anchor="middle"
        >{month.name}</textPath
      >
    </text>
  {/each}
  <path id="today" fill="None" stroke="#ccc" d={getArc(todayProps)} />
  <text>
    <textPath href="#today" startOffset="50%" text-anchor="middle"
      >{todayProps.name}</textPath
    >
  </text>
  <defs>
    <!-- A marker to be used as an arrowhead -->
    <marker
      id="arrow"
      viewBox="0 0 10 10"
      refX="5"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>
  </defs>

  <line
    x1={$xScale(todayProps.x4)}
    y1={$yScale(todayProps.y4)}
    x2={$xScale(todayProps.x1)}
    y2={$yScale(todayProps.y1)}
    stroke="black"
    marker-end="url(#arrow)"
  />
</g>
