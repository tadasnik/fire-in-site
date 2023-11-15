<script>
  import { Input, Label, Helper, Button } from "flowbite-svelte";
  import { authHandlers, authStore } from "$lib/shared/stores/authStore";
  let register = true;
  let email = "";
  let password = "";
  let confirmPassword = "";

  async function handleSubmit() {
    if (!email || (!password && register && !confirmPassword)) {
      return;
    }
    if (register && password === confirmPassword) {
      try {
        console.log("confirm password");
        await authHandlers.signup(email, password);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await authHandlers.login(email, password);
      } catch (err) {
        console.log(err);
      }
    }
    if ($authStore.currentUser) {
      window.location.href = "/privatepage";
    }
  }
</script>

<h1>{register ? "Register" : "Sign Up"}</h1>
<form>
  <div class="grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <Label class="block space-y-2">
        <span>Your email</span>
        <Input
          label="Email"
          id="email"
          name="email"
          bind:value={email}
          required
          placeholder="your@email.com"
        />
        <Helper class="text-sm">
          We’ll never share your details. Read our <a
            href="/"
            class="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Privacy Policy
          </a>
          .
        </Helper>
      </Label>
      <div class="mb-6">
        <Label for="password" class="mb-2">Password</Label>
        <Input
          type="password"
          id="password"
          placeholder="•••••••••"
          required
          bind:value={password}
        />
      </div>
      {#if register}
        <div class="mb-6">
          <Label for="confirm_password" class="mb-2">Confirm password</Label>
          <Input
            type="password"
            id="confirm_password"
            placeholder="•••••••••"
            required
            bind:value={confirmPassword}
          />
        </div>
      {/if}
      <Button on:click={handleSubmit} color="primary">Submit</Button>
    </div>
  </div>
</form>
{#if register}
  <Button
    on:click={() => {
      register = false;
    }}
    on:keydown={() => {}}
  >
    Allready have an account? <p>Log in</p>
  </Button>
{:else}
  <Button
    on:click={() => {
      register = true;
    }}
    on:keydown={() => {}}
  >
    Don't have an account?
    <p>Sign up</p>
  </Button>
{/if}
