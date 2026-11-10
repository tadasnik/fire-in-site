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
    content="How FireInSite may be used: the underlying science is published and open, the FireInSite system is not available for commercial use without permission, and we welcome collaboration."
  />
  <meta
    property="og:title"
    content="Open access, collaboration and use — FireInSite"
  />
  <meta
    property="og:description"
    content="The science behind FireInSite is published and open. The system itself is not available for commercial use without our prior written permission."
  />
</svelte:head>

<div class="max-w-md mx-auto overflow-hidden md:max-w-2xl pt-10">
  <div class="flex flex-col text-slate-500">
    <div class="p-8">
      <Heading tag="h1" class="mb-6 text-2xl text-primary-900">
        Open access, collaboration and use of FireInSite
      </Heading>

      <P class="mt-2">
        <span class="font-bold text-primary-900"
          >The science behind FireInSite is open.</span
        >
        The fuel moisture measurements, vegetation flammability data and the UK
        fuel models derived from them are published, and the fire behaviour
        equations come from the published BehavePlus system. Use that underlying
        science from those sources, on the terms under which it was released.
        This statement adds no restriction to data or publications already made
        available.
      </P>
      <!--
        TODO(legal): the published data and fuel models went out under their own
        licence terms, which have not been checked. If any were released under a
        permissive licence such as CC BY, commercial use of them is already
        permitted and nothing here can withdraw that.
      -->

      <P class="mt-6">
        <span class="font-bold text-primary-900"
          >This statement covers FireInSite as a system</span
        >
        — the application, its source code, and the integration and calibration
        of the models within it. That is our own work, and at this point in time
        it is <span class="font-bold">not available for commercial use</span>. It
        may not be reproduced, adapted, incorporated into other products or
        services, or otherwise used for commercial purposes without our prior
        written permission.
      </P>

      <P class="mt-6">
        By commercial use we mean use intended for or directed toward commercial
        advantage or private monetary compensation — for example, consultancy
        delivered to a client, or a product or service offered for a fee. Use by
        fire and rescue services, public bodies, researchers and educators for
        their own purposes is not commercial use.
      </P>
      <!--
        TODO(legal): this definition is modelled on the UK Non-Commercial
        Government Licence and needs confirming. The carve-in for fire and
        rescue services and public bodies matters most — they are core users and
        should not have to ask whether they are permitted.
      -->

      <P class="mt-6">
        We welcome open collaboration. Our aim is to keep FireInSite open, and
        we would be glad to work with individuals and organisations who share
        that approach and who wish to expand, improve and continue its
        development. {CONTACT_SENTENCE}
      </P>

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
