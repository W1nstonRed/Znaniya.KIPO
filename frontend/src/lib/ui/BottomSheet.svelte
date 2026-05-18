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
    let sheetDragging = $state(false) // тянем именно шторку (не скролл)

    const CLOSE_THRESHOLD = 120

    // ручка — всегда тянет шторку
    function onPointerDown(e: PointerEvent) {
        dragging = true
        sheetDragging = true
        startY = e.clientY
        currentY = 0
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging) return
        const delta = e.clientY - startY
        currentY = Math.max(0, delta)
    }

    function onPointerUp() {
        if (!dragging) return
        dragging = false
        sheetDragging = false
        if (currentY >= CLOSE_THRESHOLD) {
            onclose()
        }
        currentY = 0
    }

    // контент — тянет шторку только если scrollTop === 0 и движение вниз
    function onContentPointerDown(e: PointerEvent) {
        if (!scrollEl) return
        startY = e.clientY
        currentY = 0
        dragging = false
        sheetDragging = false
        // захватываем pointer чтобы получать move/up даже если курсор ушёл
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onContentPointerMove(e: PointerEvent) {
        const delta = e.clientY - startY

        if (sheetDragging) {
            // уже решили тянуть шторку
            e.preventDefault()
            currentY = Math.max(0, delta)
            return
        }

        if (!scrollEl) return

        if (delta > 0 && scrollEl.scrollTop === 0) {
            // тянем вниз и скролл в самом верху — перехватываем
            sheetDragging = true
            dragging = true
            e.preventDefault()
            currentY = Math.max(0, delta)
        }
        // иначе — не мешаем нативному скроллу
    }

    function onContentPointerUp() {
        if (!dragging) return
        dragging = false
        sheetDragging = false
        if (currentY >= CLOSE_THRESHOLD) {
            onclose()
        }
        currentY = 0
    }
</script>

<!-- оверлей -->
{#if open}
    <div
        role="presentation"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onclick={onclose}
    ></div>
{/if}

<!-- шторка -->
<div
    bind:this={sheet}
    class="fixed right-0 bottom-0 left-0 z-50"
    style="
        transform: translateY({open ? currentY + 'px' : '100%'});
        transition: {dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'};
    "
>
    <div
        class="glass mx-3 mb-3 flex max-h-[80dvh] flex-col"
        style="border-radius: var(--radius-xl)"
    >
        <!-- ручка -->
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

        <!-- скроллящийся контент -->
        <div
            role="presentation"
            bind:this={scrollEl}
            class="flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 pb-6"
            onpointerdown={onContentPointerDown}
            onpointermove={onContentPointerMove}
            onpointerup={onContentPointerUp}
            onpointercancel={onContentPointerUp}
        >
            {@render children()}
        </div>
    </div>
</div>
