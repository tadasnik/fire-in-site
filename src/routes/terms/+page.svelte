<script>
  import { Heading, P, A, Secondary } from "flowbite-svelte";
  import {
    MARKED_NAME,
    MARK_SYMBOL,
    COPYRIGHT_LINE,
    CONTACT_SENTENCE,
    STATEMENT_REVIEWED,
  } from "$lib/shared/legal.js";
</script>

<svelte:head>
  <title>Open access, collaboration and use — FireInSite</title>
  <meta
    name="description"
    content="How FireInSite may be used: open access for non-commercial use, an invitation to collaborate, and the FireInSite name and brand identity."
  />
  <meta
    property="og:title"
    content="Open access, collaboration and use — FireInSite"
  />
  <meta
    property="og:description"
    content="How FireInSite may be used: open access for non-commercial use, an invitation to collaborate, and the FireInSite name and brand identity."
  />
</svelte:head>

<div class="max-w-md mx-auto overflow-hidden md:max-w-2xl pt-10">
  <div class="flex flex-col text-slate-500">
    <div class="p-8">
      <Heading tag="h1" class="mb-6 text-2xl text-primary-900">
        Open access, collaboration and use of FireInSite
      </Heading>

      <P class="mt-2">
        FireInSite has been developed as an open access tool. At this point in
        time, the data, equations, fuel models and other content held within
        FireInSite are
        <span class="font-bold">not available for commercial use</span>. They
        may not be reproduced, adapted, incorporated into other products or
        services, or otherwise used for commercial purposes without our prior
        written permission.
      </P>

      <P class="mt-6">
        We welcome open collaboration. Our aim is to keep FireInSite open, and
        we would be glad to work with individuals and organisations who share
        that approach and who wish to expand, improve and continue its
        development.{#if CONTACT_SENTENCE}
          {" "}{CONTACT_SENTENCE}
        {/if}
      </P>
      <!--
        TODO(legal): the collaboration paragraph needs a contact address.
        Set CONTACT_EMAIL in $lib/shared/legal.js and the sentence appears.
      -->

      <P class="mt-6">
        {MARK_SYMBOL === "™"
          ? "The FireInSite name and brand identity are the subject of a trade mark application."
          : "The FireInSite name and brand identity are registered trade marks."}
        We are seeking to protect them so that FireInSite remains clearly
        associated with the scientific integrity of the work behind it. Please
        do not use the {MARKED_NAME} name or logo in a way that suggests
        endorsement by, or affiliation with, the FireInSite team without our
        written agreement.
      </P>

      <P class="mt-6 text-sm">
        {COPYRIGHT_LINE}. All rights reserved, subject to the permissions
        described above.
      </P>
      <!--
        TODO(legal): COPYRIGHT_HOLDER is still "FireInSite project team", which
        is not a legal entity able to grant or refuse the permissions above.
        Confirm the holder with research contracts / IP before publishing.
      -->
    </div>

    <div class="px-8 pb-8">
      <Secondary class="mb-4 text-xl text-primary-900">
        Reliance on FireInSite outputs
      </Secondary>
      <P class="mt-2 text-sm">
        FireInSite is an experimental tool under active development and its
        predictions are advisory only. We cannot accept responsibility for any
        loss or damage arising from use of the application or the information it
        provides. Nothing in this statement excludes or limits our liability for
        death or personal injury caused by negligence, or for anything else that
        cannot lawfully be excluded or limited.
      </P>
      <!--
        TODO(legal): the carve-out sentence above is required — under the Unfair
        Contract Terms Act 1977 liability for death or personal injury from
        negligence cannot be excluded, and a blanket exclusion risks being
        unenforceable in full. Confirm the wording before publishing.
      -->
    </div>

    <div class="px-8 pb-12">
      <P class="text-xs">Last reviewed: {STATEMENT_REVIEWED}.</P>
    </div>
  </div>
</div>
