import { Component, splitProps } from 'solid-js';

interface SkeletonProps {
	width?: string;
	height?: string;
	borderRadius?: string;
	class?: string;
}

const Skeleton: Component<SkeletonProps> = (props) => {
	const [local, others] = splitProps(props, ['width', 'height', 'borderRadius', 'class']);

	return (
		<div
			class={`skeleton ${local.class ?? ''}`}
			style={{
				width: local.width,
				height: local.height,
				'border-radius': local.borderRadius
			}}
			{...others}
		/>
	);
};

export default Skeleton;
