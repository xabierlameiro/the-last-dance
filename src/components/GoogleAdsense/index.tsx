type Props = {
    client?: string;
    slot: string;
};

const GoogleAdsense = ({ client = 'ca-pub-3537017956623483', slot }: Props) => {
    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default GoogleAdsense;
