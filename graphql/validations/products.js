const Joi = require("@hapi/joi");

const ITEM_CONSTANTS = require("../../constants/items");
const { validateObjectId } = require("./utils/common");

const QUERY_ONE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
});

const QUERY_ALL = Joi.object({
  filter: Joi.object()
    .optional()
    .allow(null)
    .keys({
      categories: Joi.array()
        .optional()
        .allow(null)
        .items(Joi.string().optional().invalid("")),
      sizes: Joi.array()
        .optional()
        .allow(null)
        .items(
          Joi.string()
            .optional()
            .invalid("")
            .valid(...ITEM_CONSTANTS.SIZES)
        ),
      colors: Joi.array()
        .optional()
        .allow(null)
        .items(Joi.string().optional().invalid("").custom(validateObjectId)),
      price: Joi.object().optional().allow(null).keys({
        min: Joi.number().required(),
        max: Joi.number().required(),
      }),
      product_tags: Joi.array()
        .optional()
        .allow(null)
        .items(Joi.string().optional().invalid("")),
      is_sellable: Joi.boolean().optional().allow(null),
    }),
});

const CREATE = Joi.object({
  product_name: Joi.string().required(),
  product_description: Joi.string().optional(),
  product_regular_price: Joi.string().required(),
  product_special_price: Joi.string().optional(),
  product_colors: Joi.array()
    .required()
    .items(Joi.string().invalid("").custom(validateObjectId)),
  product_sizes: Joi.array()
    .required()
    .items(Joi.string().valid(...ITEM_CONSTANTS.SIZES)),
  product_tags: Joi.array().optional().items(Joi.string()),
  item: Joi.string().required(),
  design: Joi.string().required(),
});

const UPDATE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  product_name: Joi.string().optional(),
  product_description: Joi.string().optional(),
  product_regular_price: Joi.string().optional(),
  product_special_price: Joi.string().optional(),
  product_colors: Joi.array()
    .optional()
    .items(Joi.string().invalid("").custom(validateObjectId)),
  product_sizes: Joi.array()
    .optional()
    .items(Joi.string().valid(...ITEM_CONSTANTS.SIZES)),
  product_tags: Joi.array().optional().items(Joi.string()),
  item: Joi.string().optional(),
  design: Joi.string().optional(),
});

const DELETE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
});

const UPDATE_DESIGN_CONFIG = Joi.object({
  product_id: Joi.string().required().custom(validateObjectId),
  design_config: Joi.array().items(
    Joi.object()
      .required()
      .keys({
        side: Joi.string().optional().allow(null),
        index: Joi.number().integer().positive().optional().allow(null),
        layers: Joi.array()
          .required()
          .items(
            Joi.object()
              .required()
              .keys({
                type: Joi.string().required(),
                design: Joi.string().optional().custom(validateObjectId),
                orig_width: Joi.number().optional(),
                orig_height: Joi.number().optional(),
                topleft_x: Joi.number().optional(),
                topleft_y: Joi.number().optional(),
                scale: Joi.number().optional(),
                rotate: Joi.number().optional(),
                order: Joi.number().optional(),
              })
          ),
      })
  ),
});

const UPDATE_MOCKUP_DESIGN_CONFIG = Joi.object({
  product_id: Joi.string().required().custom(validateObjectId),
  mock_up_design_config: Joi.array().items(
    Joi.object()
      .required()
      .keys({
        side: Joi.string().optional().allow(null),
        index: Joi.number().integer().positive().optional().allow(null),
        layers: Joi.array()
          .required()
          .items(
            Joi.object()
              .required()
              .keys({
                type: Joi.string().required(),
                design: Joi.string().optional().custom(validateObjectId),
                orig_width: Joi.number().optional(),
                orig_height: Joi.number().optional(),
                topleft_x: Joi.number().optional(),
                topleft_y: Joi.number().optional(),
                scale: Joi.number().optional(),
                rotate: Joi.number().optional(),
                order: Joi.number().optional(),
              })
          ),
      })
  ),
});

const UPDATE_FEATURED_COLOR_IS_SELLABLE = Joi.object({
  products: Joi.array().items(
    Joi.object()
      .required()
      .keys({
        id: Joi.string().required().custom(validateObjectId),
        featured_color: Joi.string().required().custom(validateObjectId),
        is_sellable: Joi.bool().required(),
      })
  ),
});

module.exports = {
  QUERY_ONE,
  QUERY_ALL,
  CREATE,
  UPDATE,
  DELETE,
  UPDATE_DESIGN_CONFIG,
  UPDATE_MOCKUP_DESIGN_CONFIG,
  UPDATE_FEATURED_COLOR_IS_SELLABLE,
};
