<script>
  import AuthReset from "$lib/components/auth/AuthReset.svelte";
  import SignIn from "$lib/components/auth/SignIn.svelte";
  import SignUp from "$lib/components/auth/SignUp.svelte";
  import { register, resetCredentials } from "$lib/shared/stores/authStore";
  import FireInSiteLogo from "$lib/assets/FireInSitelogo.png";
  console.log("register = ", register);
  console.log("resetCredentials = ", resetCredentials);
</script>

<section>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <p
        class="flex items-center mb-6 text-3xl font-semibold text-gray-900 dark:text-white"
      >
        <span class="text-primary-900 dark:text-primary-400">
          <img
            src={FireInSiteLogo}
            class="me-3 h-6 sm:h-9"
            alt="fireInSite Logo"
          />
        </span>
      </p>
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
      >
        {#if $resetCredentials}
          <AuthReset />
        {:else if $register}
          <SignUp />
        {:else}
          <SignIn />
        {/if}
      </div>
    </div>
  </section>
</section>
