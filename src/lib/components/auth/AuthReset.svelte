<script>
  import { Input, Label, Helper, ButtonGroup, Button } from "flowbite-svelte";
  import { authHandlers, authStore } from "$lib/shared/stores/authStore";

  let action = "";
  let newPass = "";
  let newEmail = "";

  async function handleSubmit() {
    if (!action) {
      return;
    }
    if (action === "updadePass") {
      return await authHandlers.updatePassword(newPass);
    }
    if (action === "updateEmail") {
      return await authHandlers.updateEmail(newEmail);
    }
  }
  $: console.log("AuthReset action = ", action);
</script>

<div class="container">
  <ButtonGroup>
    <Button
      on:click={() => {
        action = "updateEmail";
      }}>Update email</Button
    >
    <Button
      on:click={() => {
        action = "updatePass";
      }}>Update Password</Button
    >
  </ButtonGroup>

  {#if action === "updateEmail"}
    <form>
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <Label class="block space-y-2">
            <span>Set new email</span>
            <Input
              label="Email"
              id="new email"
              name="email"
              bind:value={newEmail}
              required
              placeholder="New email"
            />
          </Label>
          <Button on:click={handleSubmit} color="primary">Submit</Button>
        </div>
      </div>
    </form>
  {/if}
  {#if action === "updatePass"}
    <form>
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <Label for="password" class="mb-2">New password</Label>
          <Input
            type="password"
            id="password"
            placeholder="•••••••••"
            required
            bind:value={newPass}
          />
          <Button on:click={handleSubmit} color="primary">Submit</Button>
        </div>
      </div>
    </form>
  {/if}
</div>
