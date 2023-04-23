
export const info = function (arg: unknown) {
  console.info(arg);
};
export const warn = function (arg: unknown) {
	console.warn(arg);
};
export const error = console.error;
export default {
	  info,
	  warn,
	  error,
};
