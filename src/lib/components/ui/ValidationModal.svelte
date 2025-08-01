<script>
  import { Modal, P, A } from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
  export let openValidationModal;
  function handleFuelClick() {
    console.log("clickOutsideModal parrent was", openValidationModal);
    openValidationModal = !openValidationModal;
  }
  $: console.log("openValidationModal", openValidationModal);
</script>

<A on:click={handleFuelClick}>User feedback</A>
<Modal
  title="Submit flame length observations"
  form
  bind:open={openValidationModal}
  autoclose
  outsideclose
>
  <P
    >We would be grateful if you could contribute flame length observations to
    support the validation of FireInSite's fire behaviour predictions. Your
    observations—whether from recent or past fire events, including both
    prescribed burns and wildfires—are highly valuable to help us improve the
    system's accuracy. Submissions can be made using the external link below.
    Thank you for supporting fire science and operational tools!
  </P>
  <P
    ><A
      target="_blank"
      href="https://survey123.arcgis.com/share/6e2a99f83003452d9b50ef9dcdcde274"
      >Flame length observation form <ArrowRightOutline
        class="ms-2 h-6 w-6"
      /></A
    ></P
  >
</Modal>
