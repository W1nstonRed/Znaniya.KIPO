<script lang="ts">
    import { type Snippet } from 'svelte'

    interface Props {
        open: boolean
        onclose: () => void
        children: Snippet
    }

    let { open = $bindable(), onclose, children }: Props = $props()

    let sheet = $state<HTMLDivElement>()
    let scrollEl = $state<HTMLDivElement>()
    let startY = $state(0)
    let currentY = $state(0)
    let dragging = $state(false)
    let sheetDragging = $state(false)
    let intentConfirmed = $state(false)

    const CLOSE_THRESHOLD = 120
    const INTENT_THRESHOLD = 8

    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            dragging = false
            sheetDragging = false
            intentConfirmed = false
            currentY = 0
        }
    })

    function onPointerDown(e: PointerEvent) {
        dragging = true
        sheetDragging = true
        intentConfirmed = false
        startY = e.clientY
        currentY = 0
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging) return
        if (e.pointerType === 'mouse' && e.buttons !== 1) {
            onPointerUp()
            return
        }
        const delta = e.clientY - startY
        if (!intentConfirmed) {
            if (Math.abs(delta) < INTENT_THRESHOLD) return
            intentConfirmed = true
        }
        currentY = Math.max(0, delta)
    }

    function onPointerUp() {
        if (!dragging) return
        dragging = false
        sheetDragging = false
        intentConfirmed = false
        if (currentY >= CLOSE_THRESHOLD) {
            onclose()
        }
        currentY = 0
    }

    function onContentPointerDown(e: PointerEvent) {
        if (!scrollEl) return
        startY = e.clientY
        currentY = 0
        dragging = false
        sheetDragging = false
        intentConfirmed = false
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onContentPointerMove(e: PointerEvent) {
        if (e.pointerType === 'mouse' && e.buttons !== 1) {
            onContentPointerUp()
            return
        }
        const delta = e.clientY - startY

        if (sheetDragging) {
            if (!intentConfirmed) {
                if (Math.abs(delta) < INTENT_THRESHOLD) return
                intentConfirmed = true
            }
            e.preventDefault()
            currentY = Math.max(0, delta)
            return
        }

        if (!scrollEl) return

        if (delta > INTENT_THRESHOLD && scrollEl.scrollTop === 0) {
            sheetDragging = true
            dragging = true
            intentConfirmed = true
            e.preventDefault()
            currentY = Math.max(0, delta)
        }
    }

    function onContentPointerUp() {
        if (!dragging) return
        dragging = false
        sheetDragging = false
        intentConfirmed = false
        if (currentY >= CLOSE_THRESHOLD) {
            onclose()
        }
        currentY = 0
    }
</script>

{#if open}
    <div
        role="presentation"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onclick={onclose}
    ></div>
{/if}

<div
    bind:this={sheet}
    class="fixed right-0 bottom-0 left-0 z-50"
    class:pointer-events-none={!open}
    style="
        transform: translateY({open ? currentY + 'px' : '100%'});
        transition: {dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'};
    "
>
    <div
        class="glass mx-3 mb-3 flex max-h-[80dvh] flex-col"
        style="border-radius: var(--radius-xl)"
    >
        <div
            role="presentation"
            class="shrink-0 cursor-grab touch-none py-3 active:cursor-grabbing"
            onpointerdown={onPointerDown}
            onpointermove={onPointerMove}
            onpointerup={onPointerUp}
            onpointercancel={onPointerUp}
        >
            <div class="mx-auto w-15 rounded-2xl bg-white/20 p-1"></div>
        </div>

        <div
            role="presentation"
            bind:this={scrollEl}
            class="flex-1 overflow-y-auto overscroll-contain px-6 pb-6"
            style="touch-action: pan-y"
            onpointerdown={onContentPointerDown}
            onpointermove={onContentPointerMove}
            onpointerup={onContentPointerUp}
            onpointercancel={onContentPointerUp}
        >
            {@render children()}
        </div>
    </div>
</div>
