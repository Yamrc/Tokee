<script lang="ts">
	import Icon from '@iconify/svelte';

	const handleRefresh = (): void => {
		window.dispatchEvent(new CustomEvent('tokee:refresh'));
	};
</script>

<button
	type="button"
	class="btn-plain scale-animation h-11 w-11 rounded-lg active:scale-90"
	aria-label="刷新数据"
	title="刷新数据"
	onclick={handleRefresh}
>
	<Icon icon="material-symbols:refresh" class="text-[1.25rem]" aria-hidden="true" />
</button>
