import React from 'react';
import Loading from './Loading';
// Renamed from `Error`: SDD-L07 gives this component a real `Error` prop, and the default import was
// shadowing the global `Error` type in this module — `error: Error` would have annotated the prop
// with the icon component's type instead.
import ErrorIcon from './Error';
import Tooltip from '@/components/Tooltip';
import { useIntl } from 'react-intl';
import { ResponseShapeError, ResponseStatusError } from '@/helpers/createFetcher';

type Props = {
    error: Error | undefined;
    loading: boolean;
    errorTitle?: string;
    loadingTitle?: string;
    children: React.ReactNode;
};

/**
 * @description - Decide which of the failure message ids fits this error.
 *
 * Kept outside the component so the mapping can be read on its own: a route that answered a status
 * we do not accept is a different event from a route that answered a body we do not recognise, and
 * a reader can act on the difference.
 */
const errorMessageId = (error: Error): string => {
    if (error instanceof ResponseShapeError) return 'rendermanager.error.shape';
    if (error instanceof ResponseStatusError) return 'rendermanager.error.status';
    return 'rendermanager.error';
};

/**
 * @description - Renders children or error/loading icon
 *
 * SDD-L07: `error` was typed `boolean`. It never was one — every caller passes SWR's `error`, an
 * `Error` object, and it typechecked only because `useSWR<Data>` leaves the error generic at `any`.
 * The declaration therefore discarded the only information the widget had about *what* went wrong,
 * which is why all ten of them showed the same icon and the same sentence whether the route was
 * down, the network was gone, or the response no longer matched its contract.
 *
 * `errorTitle` still wins when a caller supplies one, so widget-specific wording ("heating
 * unavailable") is unchanged; the distinction only fills in where there was no wording at all.
 *
 * @param {error} Error | undefined - the failure, if there was one
 * @param {loading} boolean - loading state
 * @param {errorTitle} string - Title for error icon
 * @param {loadingTitle} string - Title for loading icon
 * @param {children} React.ReactNode - Children to render
 * @returns {React.ReactNode} - Returns children or error/loading icon
 */
const RenderManager = ({ error, loading, errorTitle, loadingTitle, children }: Props) => {
    const { formatMessage: f } = useIntl();

    if (error) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <ErrorIcon />
                </Tooltip.Trigger>
                <Tooltip.Content>{errorTitle ?? f({ id: errorMessageId(error) })}</Tooltip.Content>
            </Tooltip>
        );
    }
    if (loading) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <Loading />
                </Tooltip.Trigger>
                <Tooltip.Content>{loadingTitle ?? f({ id: 'rendermanager.loading' })}</Tooltip.Content>
            </Tooltip>
        );
    }
    return <>{children}</>;
};

export default RenderManager;
