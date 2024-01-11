<script>
  import { Input, Label, Helper, Button } from "flowbite-svelte";
  import { authHandlers, authStore } from "$lib/shared/stores/authStore";

  let register = false;
  let displayName = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  async function handleSubmit() {
    if (
      !email ||
      !password ||
      (!register && !displayName && !password && !confirmPassword)
    ) {
      return;
    }
    if (register && password === confirmPassword) {
      try {
        console.log("confirm password");
        await authHandlers.signup(email, password, displayName);
      } catch (err) {
        console.log("cought err", err.code);
        if (err.code == "auth/email-already-in-use") {
          alert("Email already in use, please log in");
        }
      }
    } else {
      try {
        await authHandlers.login(email, password);
      } catch (err) {
        console.log(err);
      }
    }
    if ($authStore.currentUser) {
      window.location.href = "/";
    }
  }
</script>

<form>
  <div class="flex flex-col gap-6 mb-6">
    <div class="">
      <h3>{register ? "Register" : "Log in"}</h3>
    </div>
    <div>
      {#if register}
        <Label class="block space-y-2">
          <span>User name</span>
          <Input
            label="Username"
            id="name"
            name="name"
            bind:value={displayName}
            required
            placeholder="User name"
          />
        </Label>
      {/if}
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
