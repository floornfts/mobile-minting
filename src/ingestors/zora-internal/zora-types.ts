export interface ZoraTokenDetails {
  chain_name: string;
  collection_address: string;
  token_id: string | null;
  collection: {
    address: string;
    name: string;
    symbol: string;
    token_standard: string;
    description: string | null;
    image: string | null;
  };
  contract_type: string;
  creator_address: string;
  creator_profile: {
    address: string;
    username: string;
    display_name: string;
    ens_name: string | null;
    avatar: string;
    current_user_hide_setting: string | null;
    following_status: string;
  };
  is_default_user_collection: boolean;
  mintable: {
    chain_name: string;
    mintable_type: string;
    token_standard: string;
    contract_address: string;
    creator_address: string;
    token_creator: string;
    collection: {
      address: string;
      name: string;
      symbol: string;
      token_standard: string;
      description: string | null;
      image: string | null;
    };
    token_id: string;
    token_name: string | null;
    mint_context: {
      mint_context_type: string;
      renderer_contract: string | null;
      permissions: Array<{
        user: string;
        token_id: number;
        is_admin: boolean;
        is_minter: boolean;
        is_sales_manager: boolean;
        is_metadata_manager: boolean;
        is_funds_manager: boolean;
      }>;
      sale_strategies: Array<{
        sale_strategies_type: string;
        fixed_price?: {
          token_id: number | null;
          sale_start: string | null;
          sale_end: string | null;
          max_tokens_per_address: string | null;
          price_per_token: string | null;
          funds_recipient: string | null;
        };
        presale?: {
          token_id: number | null;
          presale_start: string | null;
          presale_end: string | null;
          merkle_root: string | null;
          funds_recipient: string | null;
        };
        redeem_minter?: boolean;
        erc20_minter?: {
          token_id: number | null;
          sale_start: string | null;
          sale_end: string | null;
          max_tokens_per_address: string | null;
          currency: string | null;
          price_per_token: string | null;
          funds_recipient: string | null;
        };
        zora_timed_minter?: {
          token_id: number | null;
          sale_start: string | null;
          sale_end: string | null;
          mint_fee: string | null;
          secondary_activated: boolean | null;
          erc_20_z: string | null;
        };
      }>;
      royalties: Array<{
        token_id: number;
        user: string;
        royalty_bps: string;
        royaltyRecipient: string;
        royalty_mint_schedule: number;
      }>;
      contract_version: string;
      created_at_block: number;
      uri: string;
      b2r_redeemable: string | null;
      mint_fee_per_token: string;
    };
    is_active: boolean;
    cost: {
      native_price: {
        currency: {
          name: string;
          address: string;
          decimals: number;
        };
        raw: string;
        decimal: number;
      };
      block_number: number;
      eth_price: {
        currency: {
          name: string;
          address: string;
          decimals: number;
        };
        raw: string;
        decimal: number;
      };
      usdc_price: string | null;
    };
    total_mint_volume: {
      native_price: {
        currency: {
          name: string;
          address: string;
          decimals: number;
        };
        raw: string;
        decimal: number;
      };
      block_number: number;
      eth_price: {
        currency: {
          name: string;
          address: string;
          decimals: number;
        };
        raw: string;
        decimal: number;
      };
      usdc_price: string | null;
    };
    total_supply: number | null;
    total_minted: number;
    wallet_max: number | null;
    start_datetime: string;
    end_datetime: string;
    collector_summary: {
      num_unique_collectors: number;
      collector_previews: Array<{
        address: string;
        ens_name: string | null;
      }>;
    };
    metadata: string | null;
    status: string;
    uuid: string | null;
    on_chain_token_id: string | null;
    premint_token_id: string | null;
  } | null;
  media: {
    image_preview: {
      raw: string;
      mime_type: string;
      encoded_large: string | null;
      encoded_preview: string | null;
      encoded_thumbnail: string | null;
    };
    image_carousel: Array<{
      raw: string;
      mime_type: string;
      encoded_large: string | null;
      encoded_preview: string | null;
      encoded_thumbnail: string | null;
    }>;
    content_preview: {
      raw: string;
      mime_type: string;
      encoded_large: string;
      encoded_preview: string;
      encoded_thumbnail: string;
    } | null;
    content_carousel: Array<{
      raw: string;
      mime_type: string;
      encoded_large: string;
      encoded_preview: string;
      encoded_thumbnail: string;
    }> | null;
    mime_type: string | null;
    image_dimensions: string | null;
    fallback_raw_uri: string;
  };
  metadata: {
    name: string;
    description: string;
    attributes: Array<any>;
    uri: string;
    raw: {
      name: string;
      description: string;
      image: string;
      animation_url: string;
      content: {
        mime: string;
        uri: string;
      };
    };
  } | null;
  owner: string | null;
  supports_premint: boolean;
  total_minted: number;
  content_moderation_status: string | null;
  content_moderation_take_down_category: string | null;
}
