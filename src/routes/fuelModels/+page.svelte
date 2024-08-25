<script>
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    ImagePlaceholder,
    Modal,
  } from "flowbite-svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { fuelNodes } from "$lib/data/fuelNodes.js";

  import { slide } from "svelte/transition";

  const showItems = [
    "label",
    "code",
    "depth",
    "dead1Load",
    "dead10Load",
    "dead100Load",
    "totalHerbLoad",
    "liveStemLoad",
    "dead1Savr",
    "liveHerbSavr",
    "liveStemSavr",
    "deadMext",
  ];

  let openRow;
  let details;
  let doubleClickModal = false;

  const toggleRow = (i) => {
    openRow = openRow === i ? null : i;
  };
  console.log("uk fuel models", UKFuelModels);
</script>

<Table>
  <TableHead>
    {#each showItems as item}
      <TableHeadCell>{item}</TableHeadCell>
    {/each}
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each Object.entries(UKFuelModels) as [id, fuel], i}
      <TableBodyRow on:click={() => toggleRow(i)}>
        {#each showItems as item}
          <TableBodyCell>{fuel[item]}</TableBodyCell>
        {/each}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow
          on:dblclick={() => {
            doubleClickModal = true;
            details = item;
          }}
        >
          <TableBodyCell colspan="4" class="p-0">
            <div
              class="px-2 py-3"
              transition:slide={{ duration: 300, axis: "y" }}
            >
              <ImagePlaceholder />
            </div>
          </TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
<Modal
  title={details?.name}
  bind:open={doubleClickModal}
  autoclose
  outsideclose
>
  <ImagePlaceholder />
</Modal>
