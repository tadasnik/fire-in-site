<script>
  import { Input, Label, Helper, Button } from "flowbite-svelte";
  import { authHandlers, authStore } from "$lib/shared/stores/authStore";

  let register = $state(false);
  let displayName = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let success = $state(undefined);

  async function handleSubmit() {
    if (
      !email ||
      !password ||
      (!register && !displayName && !password && !confirmPassword)
    ) {
      success = false;
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
        success = false;
        console.log(err.message);
      }
    }
    if ($authStore.currentUser) {
      window.location.href = "/";
    }
  }
</script>

<section class="bg-gray-50 dark:bg-gray-900">
  <div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
  >
    <p
      class="flex items-center mb-6 text-3xl font-semibold text-gray-900 dark:text-white"
    >
      <span class="text-primary-600 dark:text-primary-500"
        ><strong>FireInSite</strong></span
      >
    </p>
    <div
      class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
        >
          {register ? "Create an account" : "Sign in to your account"}
        </h1>
        <form class="space-y-4 md:space-y-6" action="#">
          <div>
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Your email</label
            >
            <input
              type="email"
              name="email"
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@company.com"
              required=""
            />
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Password</label
            >
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required=""
            />
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="remember"
                  aria-describedby="remember"
                  type="checkbox"
                  class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  required=""
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="remember" class="text-gray-500 dark:text-gray-300"
                  >Remember me</label
                >
              </div>
            </div>
            <a
              href="#"
              class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
              >Forgot password?</a
            >
          </div>
          <button
            type="submit"
            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            onclick={handleSubmit}>Sign in</button
          >
          <p class="text-sm font-light text-gray-500 dark:text-gray-400">
            {#if !register}
              Don’t have an account yet?
              <a
                role="button"
                onclick={() => {
                  register = true;
                }}
                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >Sign up</a
              >
            {:else}
              Allready have an account?

              <a
                role="button"
                onclick={() => {
                  register = false;
                }}
                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >Sign in</a
              >
            {/if}
          </p>
        </form>
      </div>
    </div>
  </div>
</section>
<div class="container mx-auto min-w-72 max-w-md p-4">
  <form class="flex flex-col gap-6 mb-6">
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
      {#if !success && success !== undefined}
        <div class="p-8 text-red-500 bg-red-100">
          There was an error registering. Please try again.
        </div>
      {/if}
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
</div>
